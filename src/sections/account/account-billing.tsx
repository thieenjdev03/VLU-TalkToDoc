import Grid from '@mui/material/Unstable_Grid2'

import { IPaymentCard } from 'src/types/payment'
import { IAddressItem } from 'src/types/address'
import { IUserAccountBillingHistory } from 'src/types/user'

import AccountBankInfo from './account-billing-address'
import { WalletHistory, WalletTransaction } from './wallet-history'

// ----------------------------------------------------------------------

type Props = {
  plans: {
    subscription: string
    price: number
    primary: boolean
  }[]
  cards: IPaymentCard[]
  invoices: IUserAccountBillingHistory[]
  addressBook: IAddressItem[]
  walletBalance: number
  walletHistory: WalletTransaction[]
  userProfile: any
}

export default function AccountBilling({
  cards,
  plans,
  invoices,
  addressBook,
  walletBalance,
  walletHistory,
  userProfile
}: Props) {
  return (
    <Grid container spacing={5} disableEqualOverflow>
      <Grid xs={12} md={8}>
        <WalletHistory
          walletBalance={walletBalance}
          walletHistory={walletHistory}
        />
      </Grid>
      <Grid xs={12} md={4}>
        {/* <AccountBillingPlan plans={plans} cardList={cards} addressBook={addressBook} /> */}

        {/* <AccountBillingPayment cards={cards} /> */}

        <AccountBankInfo userProfile={userProfile} />
      </Grid>

      {/* <Grid xs={12} md={4}>
        <AccountBillingHistory invoices={invoices} />
      </Grid> */}
    </Grid>
  )
}
