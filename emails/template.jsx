import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Section,
} from "@react-email/components";
import * as React from "react";

// Sample Budget Alert Email Template
export default function EmailTemplate({
  userName = "",
  type = "budget-alert",
  data = { percentageUsed: 0, budgetAmount: 0, totalExpenses: 0 },
}) {
  if (type === "monthly-report") {
    return (
      <Html>
        <Head />
        <Preview>Your Monthly Budget Report</Preview>
        <Body style={styles.body}>
          <Container style={styles.container}>
            <Heading style={styles.title}>📊 Monthly Report</Heading>
            <Text style={styles.text}>Hi {userName},</Text>
            <Text style={styles.text}>
              Your monthly report will be available soon.
            </Text>
          </Container>
        </Body>
      </Html>
    );
  }

  if (type === "budget-alert") {
    return (
      <Html>
        <Head />
        <Preview>Budget Alert - You've used {data?.percentageUsed}%</Preview>
        <Body style={styles.body}>
          <Container style={styles.container}>
            <Heading style={styles.title}>🚨 Budget Alert</Heading>

            <Text style={styles.text}>Hello {userName},</Text>
            <Text style={styles.text}>
              You’ve used <strong>{data?.percentageUsed.toFixed(1)}%</strong> of
              your monthly budget.
            </Text>

            <Section style={styles.statsContainer}>
              <div style={styles.stat}>
                <Text style={styles.label}>💼 Budget Amount</Text>
                <Text style={styles.value}>${data?.budgetAmount}</Text>
              </div>
              <div style={styles.stat}>
                <Text style={styles.label}>🧾 Spent So Far</Text>
                <Text style={styles.value}>${data?.totalExpenses}</Text>
              </div>
              <div style={styles.stat}>
                <Text style={styles.label}>💰 Remaining</Text>
                <Text style={styles.value}>
                  ${(data?.budgetAmount - data?.totalExpenses).toFixed(2)}
                </Text>
              </div>
            </Section>

            <Text style={styles.footer}>
              This is an automated message from your Expense Tracker App. Stay
              in control of your finances 💰
            </Text>
          </Container>
        </Body>
      </Html>
    );
  }

  return null;
}

// 🎨 Styles
const styles = {
  body: {
    backgroundColor: "#f9fafb",
    fontFamily: "Arial, sans-serif",
    padding: "0",
  },
  container: {
    backgroundColor: "#ffffff",
    padding: "20px",
    maxWidth: "600px",
    margin: "auto",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  },
  title: {
    fontSize: "22px",
    marginBottom: "10px",
    color: "#dc2626",
  },
  text: {
    fontSize: "16px",
    margin: "8px 0",
    color: "#333333",
  },
  statsContainer: {
    marginTop: "20px",
    padding: "10px 0",
    borderTop: "1px solid #e5e7eb",
    borderBottom: "1px solid #e5e7eb",
  },
  stat: {
    margin: "10px 0",
  },
  label: {
    fontSize: "14px",
    color: "#6b7280",
  },
  value: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#111827",
  },
  footer: {
    fontSize: "12px",
    marginTop: "30px",
    color: "#9ca3af",
    textAlign: "center",
  },
};
