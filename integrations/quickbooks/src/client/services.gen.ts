// This file is auto-generated by @hey-api/openapi-ts

import { createClient, createConfig, type Options } from '@hey-api/client-fetch';
import type { GetAccountData, GetAccountError, GetAccountResponse, GetPurchaseData, GetPurchaseError, GetPurchaseResponse, GetJournalEntryData, GetJournalEntryError, GetJournalEntryResponse, GetInvoiceData, GetInvoiceError, GetInvoiceResponse, GetPaymentData, GetPaymentError, GetPaymentResponse, GetBillData, GetBillError, GetBillResponse, GetBillPaymentData, GetBillPaymentError, GetBillPaymentResponse, GetCreditMemoData, GetCreditMemoError, GetCreditMemoResponse, GetDepositData, GetDepositError, GetDepositResponse, GetTransferData, GetTransferError, GetTransferResponse, GetVendorData, GetVendorError, GetVendorResponse, GetCustomerData, GetCustomerError, GetCustomerResponse, GetItemData, GetItemError, GetItemResponse, GetCompanyInfoData, GetCompanyInfoError, GetCompanyInfoResponse, QueryData, QueryError, QueryResponse2, GetPreferencesData, GetPreferencesError, GetPreferencesResponse, GetTransactionListData, GetTransactionListError, GetTransactionListResponse, CdcData, CdcError, CdcResponse } from './types.gen';

export const client = createClient(createConfig());

export const getAccount = <ThrowOnError extends boolean = false>(options: Options<GetAccountData, ThrowOnError>) => { return (options?.client ?? client).get<GetAccountResponse, GetAccountError, ThrowOnError>({
    ...options,
    url: '/account/{id}'
}); };

export const getPurchase = <ThrowOnError extends boolean = false>(options: Options<GetPurchaseData, ThrowOnError>) => { return (options?.client ?? client).get<GetPurchaseResponse, GetPurchaseError, ThrowOnError>({
    ...options,
    url: '/purchase/{id}'
}); };

export const getJournalEntry = <ThrowOnError extends boolean = false>(options: Options<GetJournalEntryData, ThrowOnError>) => { return (options?.client ?? client).get<GetJournalEntryResponse, GetJournalEntryError, ThrowOnError>({
    ...options,
    url: '/journalentry/{id}'
}); };

export const getInvoice = <ThrowOnError extends boolean = false>(options: Options<GetInvoiceData, ThrowOnError>) => { return (options?.client ?? client).get<GetInvoiceResponse, GetInvoiceError, ThrowOnError>({
    ...options,
    url: '/invoice/{id}'
}); };

export const getPayment = <ThrowOnError extends boolean = false>(options: Options<GetPaymentData, ThrowOnError>) => { return (options?.client ?? client).get<GetPaymentResponse, GetPaymentError, ThrowOnError>({
    ...options,
    url: '/payment/{id}'
}); };

export const getBill = <ThrowOnError extends boolean = false>(options: Options<GetBillData, ThrowOnError>) => { return (options?.client ?? client).get<GetBillResponse, GetBillError, ThrowOnError>({
    ...options,
    url: '/bill/{id}'
}); };

export const getBillPayment = <ThrowOnError extends boolean = false>(options: Options<GetBillPaymentData, ThrowOnError>) => { return (options?.client ?? client).get<GetBillPaymentResponse, GetBillPaymentError, ThrowOnError>({
    ...options,
    url: '/billpayment/{id}'
}); };

export const getCreditMemo = <ThrowOnError extends boolean = false>(options: Options<GetCreditMemoData, ThrowOnError>) => { return (options?.client ?? client).get<GetCreditMemoResponse, GetCreditMemoError, ThrowOnError>({
    ...options,
    url: '/creditmemo/{id}'
}); };

export const getDeposit = <ThrowOnError extends boolean = false>(options: Options<GetDepositData, ThrowOnError>) => { return (options?.client ?? client).get<GetDepositResponse, GetDepositError, ThrowOnError>({
    ...options,
    url: '/deposit/{id}'
}); };

export const getTransfer = <ThrowOnError extends boolean = false>(options: Options<GetTransferData, ThrowOnError>) => { return (options?.client ?? client).get<GetTransferResponse, GetTransferError, ThrowOnError>({
    ...options,
    url: '/transfer/{id}'
}); };

export const getVendor = <ThrowOnError extends boolean = false>(options: Options<GetVendorData, ThrowOnError>) => { return (options?.client ?? client).get<GetVendorResponse, GetVendorError, ThrowOnError>({
    ...options,
    url: '/vendor/{id}'
}); };

export const getCustomer = <ThrowOnError extends boolean = false>(options: Options<GetCustomerData, ThrowOnError>) => { return (options?.client ?? client).get<GetCustomerResponse, GetCustomerError, ThrowOnError>({
    ...options,
    url: '/customer/{id}'
}); };

export const getItem = <ThrowOnError extends boolean = false>(options: Options<GetItemData, ThrowOnError>) => { return (options?.client ?? client).get<GetItemResponse, GetItemError, ThrowOnError>({
    ...options,
    url: '/item/{id}'
}); };

export const getCompanyInfo = <ThrowOnError extends boolean = false>(options: Options<GetCompanyInfoData, ThrowOnError>) => { return (options?.client ?? client).get<GetCompanyInfoResponse, GetCompanyInfoError, ThrowOnError>({
    ...options,
    url: '/companyinfo/{id}'
}); };

export const query = <ThrowOnError extends boolean = false>(options: Options<QueryData, ThrowOnError>) => { return (options?.client ?? client).get<QueryResponse2, QueryError, ThrowOnError>({
    ...options,
    url: '/query'
}); };

export const getPreferences = <ThrowOnError extends boolean = false>(options?: Options<GetPreferencesData, ThrowOnError>) => { return (options?.client ?? client).get<GetPreferencesResponse, GetPreferencesError, ThrowOnError>({
    ...options,
    url: '/preferences'
}); };

export const getTransactionList = <ThrowOnError extends boolean = false>(options?: Options<GetTransactionListData, ThrowOnError>) => { return (options?.client ?? client).get<GetTransactionListResponse, GetTransactionListError, ThrowOnError>({
    ...options,
    url: '/reports/TransactionList'
}); };

export const cdc = <ThrowOnError extends boolean = false>(options: Options<CdcData, ThrowOnError>) => { return (options?.client ?? client).get<CdcResponse, CdcError, ThrowOnError>({
    ...options,
    url: '/cdc'
}); };