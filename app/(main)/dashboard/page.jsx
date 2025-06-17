export const dynamic = "force-dynamic";

import { getAccounts, getDashboardData } from '@/actions/dashboard'
import CreateAccountDrawer from '@/components/CreateAccountDrawer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import React, { Suspense } from 'react'
import AccountCard from './_components/accountCard'
import { getCurrentBudget } from '@/actions/budget'
import BudgetProgress from './_components/BudgetProgress'
import DashboardOverview from './_components/DashboardOverview'

async function DashboardPage() {

    const accounts = await getAccounts()

    const defaultAccount = accounts?.find(account => account.isDefault);

    let budgetData = null;
    if(defaultAccount) {
        budgetData = await getCurrentBudget(defaultAccount.id);
    }

    const transactions = await getDashboardData();

  return (
    <div>
        {/* Budget Progress */}
        {defaultAccount && (
            <BudgetProgress 
            initialBudget={budgetData?.budget}
            currentExpenses={budgetData?.currentExpenses || 0}
            />
        )}

        {/* Overview */}
        <Suspense fallback={"Loading overview..."}>
            <DashboardOverview
            accounts={accounts}
            transactions={transactions || []}
            />
        </Suspense>

        {/* Accounts Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
            <CreateAccountDrawer>
                <Card className='hover:shadow-lg border-2 transition-shadow border-dashed cursor-pointer'>
                    <CardContent className='flex text-muted-foreground flex-col items-center justify-center pt-5 h-full'>
                        <Plus className='w-8 h-8 text-gray-500 mb-2' />
                        <h2 className='text-md font-semibold mb-2'>Create New Account</h2>
                    </CardContent>
                </Card>
            </CreateAccountDrawer>

            {accounts.length > 0 && accounts?.map((account) => {
                return <AccountCard key={account.id} account={account} />;
            })}
        </div>
      
    </div>
  )
}

export default DashboardPage
