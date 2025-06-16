import { db } from "@/lib/prisma";
import { inngest } from "./client";
import { sendEmail } from "@/actions/sendEmail";

export const checkBudgetAlert = inngest.createFunction(
  { name: "Check Budget Alerts", id: "check-budget-alerts" },
  { cron: "0 */6 * * *" }, // Runs every 6 hours
  async ({ step }) => {
    const budgets = await step.run("fetch budgets", async () => {
      return await db.budget.findMany({
        include: {
          user: {
            include: {
              accounts: {
                where: {
                  isDefault: true,
                },
              },
            },
          },
        },
      });
    });

    for (const budget of budgets) {
      const defaultAccount = budget.user.accounts[0];
      if (!defaultAccount) continue;

      await step.run(`check-budget-${budget.id}`, async () => {
        try {
          const currentDate = new Date();
          const startOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
          );
          const endOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0
          );
          const expenses = await db.transaction.aggregate({
            where: {
              userId: budget.userId,
              accountId: defaultAccount.id,
              type: "EXPENSE",
              date: {
                gte: startOfMonth,
                lte: endOfMonth,
              },
            },
            _sum: {
              amount: true,
            },
          });

          const totalExpenses = expenses._sum.amount || 0;
          const budgetAmount = Number(budget.amount);
          const percentageUsed = (totalExpenses / budgetAmount) * 100;

          if (
            percentageUsed >= 80 &&
            (!budget.lastAlertSent ||
              isNewMonth(new Date(budget.lastAlertSent), new Date()))
          ) {
            // send email
            await sendEmail({
              to: budget.user.email,
              subject: "Budget Alert for" + " " + defaultAccount.name,
              react: {
                userName: budget.user.name,
                type: "budget-alert",
                data: {
                  accountName: defaultAccount.name,
                  percentageUsed,
                  budgetAmount: Number(budgetAmount).toFixed(2),
                  totalExpenses: Number(totalExpenses).toFixed(2),
                },
              },
            });

            // Update the last alert sent date
            await db.budget.update({
              where: { id: budget.id },
              data: { lastAlertSent: new Date() },
            });
          }
        } catch (error) {
          console.error("Error checking budget:", error);
          return { success: false, error: error.message };
        }
      });
    }

    return { success: true };
  }
);

function isNewMonth(lastAlertDate, currentDate) {
  return (
    lastAlertDate.getMonth() !== currentDate.getMonth() ||
    lastAlertDate.getFullYear() !== currentDate.getFullYear()
  );
}

export const handleRecurringTransactions = inngest.createFunction(
  {
    name: "Handle Recurring Transactions",
    id: "handle-recurring-transactions",
  },
  { cron: "0 0 * * *" }, // Runs every midnight
  async ({ step }) => {
    const recurringTransactions = await step.run(
      "fetch recurring transactions",
      async () => {
        return await db.transaction.findMany({
          where: {
            isRecurring: true,
            status: "COMPLETED",
            OR: [
              { lastProcessed: null },
              { nextRecurringDate: { lte: new Date() } },
            ],
          },
        });
      }
    );

    if (recurringTransactions.length > 0) {
      const events = recurringTransactions.map((recurring) => ({
        name: "transaction.recurring.process",
        data: { transactionId: transaction.id, userId: transaction.userId },
      }));
      await inngest.send(events);
    }
    return { triggered: recurringTransactions.length };
  }
);

// Helper function to determine if a transaction should be created today
export const processRecurringTransaction = inngest.createFunction(
  {
    id: "process-recurring-transaction",
    name: "Process Recurring Transaction",

    throttle: {
      limit: 10, // Limit to 10 executions per minute
      period: 60, // 60 seconds
      key: "event.data.userId", // Use userId as the key for throttling
    },
  },
  {
    event: "transaction.recurring.process",
  },

  async ({ step, event }) => {
    if (!event.data || !event.data.transactionId || !event.data.userId) {
      console.error("Invalid event data:", event.data);
      return { success: false, error: "Invalid event data" };
    }

    await step.run("process recurring transaction", async () => {
      const transaction = await db.transaction.findUnique({
        where: { id: event.data.transactionId, userId: event.data.userId },
        include: { user: true, account: true },
      });
      if (!transaction || isTransactionDue(transaction)) return;

      await db.$transaction(async (tx) => {
        const newTransaction = await tx.transaction.create({
          data: {
            type: transaction.type,
            amount: transaction.amount,
            description: `${transaction.description} (Recurring)`,
            date: new Date(),
            category: transaction.category,
            userId: transaction.userId,
            accountId: transaction.accountId,
            isRecurring: false,
          },
        });
        // Update account balance
        const balanceChange =
          transaction.type === "EXPENSE"
            ? -transaction.amount.toNumber()
            : transaction.amount.toNumber();

        await tx.account.update({
          where: { id: transaction.accountId },
          data: {
            balance: {
              increment: balanceChange,
            },
          },
        });
        // Update the last processed date and next recurring date
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            lastProcessed: new Date(),
            nextRecurringDate: calculateNextRecurringDate(
              new Date(),
              transaction.recurringInterval
            ),
          },
        });

        return newTransaction;
      });
    });
  }
);

function isTransactionDue(transaction) {
  if (!transaction.lastProcessed) return true;

  const today = new Date();
  const nextDue = new Date(transaction.nextRecurringDate);

  return nextDue <= today;
}

function calculateNextRecurringDate(date, interval) {
  const nextDate = new Date(date);
  switch (interval) {
    case "DAILY":
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case "WEEKLY":
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case "MONTHLY":
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case "YEARLY":
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    default:
      throw new Error("Invalid recurring interval");
  }
  return nextDate;
}
