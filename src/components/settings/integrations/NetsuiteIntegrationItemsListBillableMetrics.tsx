import { gql } from '@apollo/client'
import { Stack } from '@mui/material'
import { RefObject } from 'react'
import { useNavigate } from 'react-router-dom'

import { InfiniteScroll } from '~/components/designSystem'
import { GenericPlaceholder } from '~/components/GenericPlaceholder'
import { CREATE_BILLABLE_METRIC_ROUTE } from '~/core/router'
import {
  GetBillableMetricsForNetsuiteItemsListQuery,
  InputMaybe,
  MappableTypeEnum,
} from '~/generated/graphql'
import { useInternationalization } from '~/hooks/core/useInternationalization'
import EmptyImage from '~/public/images/maneki/empty.svg'
import ErrorImage from '~/public/images/maneki/error.svg'

import NetsuiteIntegrationItemHeader from './NetsuiteIntegrationItemHeader'
import NetsuiteIntegrationItemLine from './NetsuiteIntegrationItemLine'
import { NetsuiteMapItemDialogRef } from './NetsuiteMapItemDialog'

gql`
  fragment NetsuiteIntegrationItemsListBillableMetrics on BillableMetric {
    id
    name
    code
    integrationMappings(integrationId: $integrationId) {
      id
      externalId
      externalAccountCode
      externalName
      mappableType
    }
  }
`

type NetsuiteIntegrationItemsListBillableMetricsProps = {
  data: GetBillableMetricsForNetsuiteItemsListQuery | undefined
  fetchMoreBillableMetrics: Function
  hasError: boolean
  integrationId: string
  searchTerm: InputMaybe<string> | undefined
  isLoading: boolean
  netsuiteMapItemDialogRef: RefObject<NetsuiteMapItemDialogRef>
}

const NetsuiteIntegrationItemsListBillableMetrics = ({
  data,
  fetchMoreBillableMetrics,
  hasError,
  integrationId,
  isLoading,
  netsuiteMapItemDialogRef,
  searchTerm,
}: NetsuiteIntegrationItemsListBillableMetricsProps) => {
  const navigate = useNavigate()
  const { translate } = useInternationalization()
  const billableMetrics = data?.billableMetrics?.collection || []

  return (
    <Stack>
      <NetsuiteIntegrationItemHeader columnName={translate('text_6630ea71a6c2ef00bc63006e')} />
      {!!isLoading && !billableMetrics.length && searchTerm ? (
        <>
          {[0, 1, 2].map((i) => (
            <NetsuiteIntegrationItemLine
              key={`billable-metric-item-skeleton-${i}`}
              icon="pulse"
              label={''}
              description={''}
              loading={true}
            />
          ))}
        </>
      ) : !isLoading && !!hasError ? (
        <>
          {!!searchTerm ? (
            <GenericPlaceholder
              title={translate('text_623b53fea66c76017eaebb6e')}
              subtitle={translate('text_63bab307a61c62af497e0599')}
              image={<ErrorImage width="136" height="104" />}
            />
          ) : (
            <GenericPlaceholder
              title={translate('text_629728388c4d2300e2d380d5')}
              subtitle={translate('text_629728388c4d2300e2d380eb')}
              buttonTitle={translate('text_629728388c4d2300e2d38110')}
              buttonVariant="primary"
              buttonAction={() => location.reload()}
              image={<ErrorImage width="136" height="104" />}
            />
          )}
        </>
      ) : !isLoading && (!billableMetrics || !billableMetrics.length) ? (
        <>
          {!!searchTerm ? (
            <GenericPlaceholder
              title={translate('text_63bee4e10e2d53912bfe4da5')}
              subtitle={translate('text_63bee4e10e2d53912bfe4da7')}
              image={<EmptyImage width="136" height="104" />}
            />
          ) : (
            <GenericPlaceholder
              title={translate('text_629728388c4d2300e2d380c9')}
              subtitle={translate('text_629728388c4d2300e2d380df')}
              buttonTitle={translate('text_629728388c4d2300e2d3810f')}
              buttonVariant="primary"
              buttonAction={() => navigate(CREATE_BILLABLE_METRIC_ROUTE)}
              image={<EmptyImage width="136" height="104" />}
            />
          )}
        </>
      ) : (
        <InfiniteScroll
          onBottom={() => {
            const { currentPage = 0, totalPages = 0 } = data?.billableMetrics?.metadata || {}

            currentPage < totalPages &&
              !isLoading &&
              fetchMoreBillableMetrics({
                variables: { page: currentPage + 1 },
              })
          }}
        >
          <>
            {!!billableMetrics.length &&
              billableMetrics.map((billableMetric) => {
                const billableMetricMapping = billableMetric.integrationMappings?.find(
                  (mapping) => mapping.mappableType === MappableTypeEnum.BillableMetric,
                )

                return (
                  <NetsuiteIntegrationItemLine
                    key={`billableMetric-item-${billableMetric.id}`}
                    icon="pulse"
                    label={billableMetric.name}
                    description={billableMetric.code}
                    loading={false}
                    onMappingClick={() => {
                      netsuiteMapItemDialogRef.current?.openDialog({
                        integrationId,
                        type: MappableTypeEnum.BillableMetric,
                        itemId: billableMetricMapping?.id,
                        itemExternalId: billableMetricMapping?.externalId,
                        itemExternalCode: billableMetricMapping?.externalAccountCode || undefined,
                        itemExternalName: billableMetricMapping?.externalName || undefined,
                        lagoMappableId: billableMetric.id,
                      })
                    }}
                    mappingInfos={
                      !!billableMetricMapping?.id
                        ? {
                            id: billableMetricMapping.externalId,
                            name: billableMetricMapping.externalName || '',
                          }
                        : undefined
                    }
                  />
                )
              })}
            {isLoading &&
              [0, 1, 2].map((i) => (
                <NetsuiteIntegrationItemLine
                  key={`billable-metric-item-skeleton-${i}`}
                  icon="pulse"
                  label={''}
                  description={''}
                  loading={true}
                />
              ))}
          </>
        </InfiniteScroll>
      )}
    </Stack>
  )
}

export default NetsuiteIntegrationItemsListBillableMetrics
