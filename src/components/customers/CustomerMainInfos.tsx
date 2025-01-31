import { gql } from '@apollo/client'
import { Stack } from '@mui/material'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { Avatar, Button, Icon, Skeleton, Typography } from '~/components/designSystem'
import { CountryCodes } from '~/core/constants/countryCodes'
import { buildNetsuiteCustomerUrl } from '~/core/constants/externalUrls'
import { getTimezoneConfig } from '~/core/timezone'
import {
  CustomerMainInfosFragment,
  NetsuiteIntegration,
  ProviderPaymentMethodsEnum,
  ProviderTypeEnum,
  TimezoneEnum,
  useIntegrationsListForCustomerMainInfosQuery,
  usePaymentProvidersListForCustomerMainInfosQuery,
} from '~/generated/graphql'
import { useInternationalization } from '~/hooks/core/useInternationalization'
import Adyen from '~/public/images/adyen.svg'
import Gocardless from '~/public/images/gocardless.svg'
import Netsuite from '~/public/images/netsuite.svg'
import Stripe from '~/public/images/stripe.svg'
import { theme } from '~/styles'
import { SectionHeader } from '~/styles/customer'

const PaymentProviderMethodTranslationsLookup = {
  [ProviderPaymentMethodsEnum.BacsDebit]: 'text_65e1f90471bc198c0c934d92',
  [ProviderPaymentMethodsEnum.Card]: 'text_64aeb7b998c4322918c84208',
  [ProviderPaymentMethodsEnum.SepaDebit]: 'text_64aeb7b998c4322918c8420c',
  [ProviderPaymentMethodsEnum.UsBankAccount]: 'text_65e1f90471bc198c0c934d8e',
}

gql`
  fragment CustomerMainInfos on Customer {
    id
    name
    externalId
    externalSalesforceId
    legalName
    legalNumber
    taxIdentificationNumber
    phone
    email
    currency
    addressLine1
    addressLine2
    state
    country
    city
    url
    zipcode
    paymentProvider
    timezone
    netsuiteCustomer {
      id
      integrationId
      externalCustomerId
    }
    paymentProviderCode
    providerCustomer {
      id
      providerCustomerId
      providerPaymentMethods
    }
    metadata {
      id
      key
      value
    }
  }

  query paymentProvidersListForCustomerMainInfos($limit: Int) {
    paymentProviders(limit: $limit) {
      collection {
        ... on StripeProvider {
          id
          name
          code
        }

        ... on GocardlessProvider {
          id
          name
          code
        }

        ... on AdyenProvider {
          id
          name
          code
        }
      }
    }
  }

  query integrationsListForCustomerMainInfos($limit: Int) {
    integrations(limit: $limit) {
      collection {
        ... on NetsuiteIntegration {
          __typename
          id
          name
          accountId
        }
      }
    }
  }
`

interface CustomerMainInfosProps {
  loading?: boolean
  customer?: CustomerMainInfosFragment | null
  onEdit?: () => unknown
}

export const CustomerMainInfos = ({ loading, customer, onEdit }: CustomerMainInfosProps) => {
  const { translate } = useInternationalization()

  const { data: paymentProvidersData } = usePaymentProvidersListForCustomerMainInfosQuery({
    variables: { limit: 1000 },
  })
  const { data: integrationsData, loading: integrationsLoading } =
    useIntegrationsListForCustomerMainInfosQuery({
      variables: { limit: 1000 },
      skip: !customer?.netsuiteCustomer,
    })

  const linkedProvider = paymentProvidersData?.paymentProviders?.collection?.find(
    (provider) => provider?.code === customer?.paymentProviderCode,
  )

  const allNetsuiteIntegrations = integrationsData?.integrations?.collection.filter(
    (i) => i.__typename === 'NetsuiteIntegration',
  ) as NetsuiteIntegration[] | undefined

  const connectedNetsuiteIntegration = allNetsuiteIntegrations?.find(
    (integration) => integration?.id === customer?.netsuiteCustomer?.integrationId,
  ) as NetsuiteIntegration

  if (loading || !customer)
    return (
      <LoadingDetails>
        <SectionHeader variant="subhead">
          <Skeleton variant="text" height={12} width={200} />
        </SectionHeader>
        <div>
          <Skeleton variant="text" height={12} width={80} marginBottom={theme.spacing(3)} />
          <Skeleton variant="text" height={12} width={200} />
        </div>
        <div>
          <Skeleton variant="text" height={12} width={80} marginBottom={theme.spacing(3)} />
          <Skeleton variant="text" height={12} width={200} />
        </div>
      </LoadingDetails>
    )

  const {
    name,
    externalId,
    externalSalesforceId,
    legalName,
    legalNumber,
    taxIdentificationNumber,
    phone,
    email,
    url,
    currency,
    addressLine1,
    addressLine2,
    state,
    country,
    city,
    zipcode,
    paymentProvider,
    providerCustomer,
    timezone,
    metadata,
  } = customer

  return (
    <DetailsBlock>
      <SectionHeader variant="subhead">
        {translate('text_6250304370f0f700a8fdc27d')}

        <Button variant="quaternary" onClick={onEdit}>
          {translate('text_626162c62f790600f850b75a')}
        </Button>
      </SectionHeader>

      {name && (
        <div>
          <Typography variant="caption">{translate('text_626162c62f790600f850b76a')}</Typography>
          <Typography color="textSecondary" forceBreak>
            {name}
          </Typography>
        </div>
      )}
      <div>
        <Typography variant="caption">{translate('text_6250304370f0f700a8fdc283')}</Typography>
        <Typography color="textSecondary">{externalId}</Typography>
      </div>
      {timezone && (
        <div>
          <Typography variant="caption">{translate('text_6390a767b79591bc70ba39f7')}</Typography>
          <Typography color="textSecondary">
            {translate('text_638f743fa9a2a9545ee6409a', {
              zone: translate(timezone || TimezoneEnum.TzUtc),
              offset: getTimezoneConfig(timezone).offset,
            })}
          </Typography>
        </div>
      )}
      {externalSalesforceId && (
        <div>
          <Typography variant="caption">{translate('text_651fd42936a03200c126c683')}</Typography>
          <Typography color="textSecondary">{externalSalesforceId}</Typography>
        </div>
      )}
      {currency && (
        <div>
          <Typography variant="caption">{translate('text_632b4acf0c41206cbcb8c324')}</Typography>
          <Typography color="textSecondary">{currency}</Typography>
        </div>
      )}
      {legalName && (
        <div>
          <Typography variant="caption">{translate('text_626c0c301a16a600ea061471')}</Typography>
          <Typography color="textSecondary">{legalName}</Typography>
        </div>
      )}
      {legalNumber && (
        <div>
          <Typography variant="caption">{translate('text_626c0c301a16a600ea061475')}</Typography>
          <Typography color="textSecondary">{legalNumber}</Typography>
        </div>
      )}
      {taxIdentificationNumber && (
        <div>
          <Typography variant="caption">{translate('text_648053ee819b60364c675d05')}</Typography>
          <Typography color="textSecondary">{taxIdentificationNumber}</Typography>
        </div>
      )}
      {email && (
        <div>
          <Typography variant="caption">{translate('text_626c0c301a16a600ea061479')}</Typography>
          <Typography color="textSecondary">{email.split(',').join(', ')}</Typography>
        </div>
      )}
      {url && (
        <div>
          <Typography variant="caption">{translate('text_641b164cff8497006bcbd2b3')}</Typography>
          <Typography color="textSecondary">{url}</Typography>
        </div>
      )}
      {phone && (
        <div>
          <Typography variant="caption">{translate('text_626c0c301a16a600ea06147d')}</Typography>
          <Typography color="textSecondary">{phone}</Typography>
        </div>
      )}
      {(addressLine1 || addressLine2 || state || country || city || zipcode) && (
        <div>
          <Typography variant="caption">{translate('text_626c0c301a16a600ea06148d')}</Typography>
          <Typography color="textSecondary">{addressLine1}</Typography>
          <Typography color="textSecondary">{addressLine2}</Typography>
          <Typography color="textSecondary">
            {zipcode} {city} {state}
          </Typography>
          {country && <Typography color="textSecondary">{CountryCodes[country]}</Typography>}
        </div>
      )}
      {!!paymentProvider && !!linkedProvider?.name && (
        <div>
          <Typography variant="caption">{translate('text_62b1edddbf5f461ab9712795')}</Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar variant="connector" size="small">
              {paymentProvider === ProviderTypeEnum?.Stripe ? (
                <Stripe />
              ) : paymentProvider === ProviderTypeEnum?.Gocardless ? (
                <Gocardless />
              ) : paymentProvider === ProviderTypeEnum?.Adyen ? (
                <Adyen />
              ) : null}
            </Avatar>
            <Typography color="grey700">{linkedProvider?.name}</Typography>
          </Stack>
          {!!providerCustomer && !!providerCustomer?.providerCustomerId && (
            <Typography color="textSecondary">{providerCustomer?.providerCustomerId}</Typography>
          )}
          {paymentProvider === ProviderTypeEnum?.Stripe &&
            !!providerCustomer?.providerPaymentMethods?.length && (
              <>
                {providerCustomer?.providerPaymentMethods?.map((method) => (
                  <Typography key={`customer-payment-method-${method}`} color="textSecondary">
                    {translate(PaymentProviderMethodTranslationsLookup[method])}
                  </Typography>
                ))}
              </>
            )}
        </div>
      )}

      {(!!customer?.netsuiteCustomer ||
        integrationsLoading ||
        !!connectedNetsuiteIntegration?.id) && (
        <div>
          <Typography variant="caption">{translate('text_66423cad72bbad009f2f568f')}</Typography>
          {integrationsLoading ? (
            <Stack flex={1} gap={3} marginTop={1}>
              <Skeleton variant="text" height={12} width={200} />
              <Skeleton variant="text" height={12} width={200} />
            </Stack>
          ) : !!connectedNetsuiteIntegration && customer?.netsuiteCustomer?.externalCustomerId ? (
            <Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar variant="connector" size="small">
                  <Netsuite />
                </Avatar>
                <Typography color="grey700">{connectedNetsuiteIntegration?.name}</Typography>
              </Stack>
              <InlineLink
                target="_blank"
                rel="noopener noreferrer"
                to={buildNetsuiteCustomerUrl(
                  connectedNetsuiteIntegration?.accountId,
                  customer?.netsuiteCustomer?.externalCustomerId,
                )}
              >
                <Typography color="info600">
                  {customer?.netsuiteCustomer?.externalCustomerId} <Icon name="outside" />
                </Typography>
              </InlineLink>
            </Stack>
          ) : null}
        </div>
      )}
      {!!metadata?.length &&
        metadata.map((meta) => (
          <div key={`customer-metadata-${meta.id}`}>
            <Typography variant="caption" noWrap>
              {meta.key}
            </Typography>
            <MetadataValue color="textSecondary">{meta.value}</MetadataValue>
          </div>
        ))}
    </DetailsBlock>
  )
}

const LoadingDetails = styled.div`
  > *:first-child {
    margin-bottom: ${theme.spacing(7)};
  }

  > *:not(:first-child) {
    margin-bottom: ${theme.spacing(7)};
  }
`

const DetailsBlock = styled.div`
  > *:first-child {
    margin-bottom: ${theme.spacing(6)};
  }

  > *:not(:first-child) {
    margin-bottom: ${theme.spacing(4)};
  }
`

const MetadataValue = styled(Typography)`
  line-break: anywhere;
`

const InlineLink = styled(Link)`
  width: fit-content;
  line-break: anywhere;

  &:hover {
    text-decoration: none;
  }
`
