import { useWeb3React } from '@web3-react/core'
import Big from 'big.js'
import createErc20 from 'erc-20-lib'
import { useTranslations } from 'next-intl'
import React, { useContext, useEffect, useState } from 'react'
import useSWR from 'swr'

import Button from '../../components/Button'
import PureContext from '../../components/context/Pure'
import { ExplorerLink } from '../../components/ExplorerLink'
import Layout from '../../components/Layout'
import UtilFormBox from '../../components/UtilFormBox'
import { fromUnit } from '../../utils'

// Comes from doing web3.utils.sha3('Approval(address,address,uint256)')
const APPROVAL_TOPIC =
  '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925'
const BLOCK_NUMBER_WINDOW = 5000 // range of blocks to review logs information
const MIN_BLOCK_TO_SYNC = 200000 // Sep-07-2015 09:33:09 PM +UTC

const getPreviousFromBlock = (pivotBlock, chunkIndex, minBlock) =>
  Math.max(minBlock, pivotBlock - BLOCK_NUMBER_WINDOW * chunkIndex)

const useLastBlockNumber = function () {
  const { active, library, chainId } = useWeb3React()
  return useSWR(active ? [`lastBlockNumber-${chainId}`, chainId] : null, () =>
    library.eth.getBlockNumber()
  )
}

const parseLogs = logs =>
  logs.map(({ address, blockNumber, data, transactionHash, topics }) => ({
    address,
    allowance: data,
    blockNumber,
    spender: topics[2].replace(/0{24}/, ''),
    transactionHash
  }))

const SyncStatus = {
  Error: 0,
  Finished: 2,
  Syncing: 1
}

const getNewestApprovals = function ({ logs, tokenApprovals, library }) {
  const allCombinations = new Set([
    ...tokenApprovals.map(({ address, spender }) => `${address}-${spender}`),
    ...logs.map(({ address, spender }) => `${address}-${spender}`)
  ])
  return Array.from(allCombinations)
    .map(function (string) {
      const [address, spender] = string.split('-')
      const allOperations = tokenApprovals
        .filter(
          tokenApproval =>
            tokenApproval.spender === spender &&
            tokenApproval.address === address
        )
        .concat(
          logs.filter(log => log.spender === spender && log.address === address)
        )
        .sort((a, b) => b.blockNumber - a.blockNumber)

      const newestOperation = allOperations[0]
      if (library.utils.hexToNumberString(newestOperation.allowance) === '0') {
        return
      }
      return newestOperation
    })
    .filter(Boolean) // remove empties
}

const DEFAULT_SYNC_BLOCK_STATE = {
  chunkIndex: 0,
  fromBlock: MIN_BLOCK_TO_SYNC,
  hasSyncToMinBlock: false,
  toBlock: undefined,
  tokenApprovals: []
}

function useTokenApprovals() {
  const { active, library, account, chainId } = useWeb3React()
  const [syncBlock, setSyncBlock] = useState(DEFAULT_SYNC_BLOCK_STATE)

  const [syncStatus, setSyncStatus] = useState(SyncStatus.Syncing)

  const { data: lastBlockNumber } = useLastBlockNumber()
  const localStorageKey =
    chainId && account ? `pf-token-revokes-${chainId}-${account}` : null

  // this effect takes care of loading the restore point of sync process
  // or setting the initial data if syncing for the first time
  useEffect(
    function () {
      if (!localStorageKey) {
        setSyncBlock(DEFAULT_SYNC_BLOCK_STATE)
        return
      }

      const storedItem = localStorage.getItem(localStorageKey)

      if (!storedItem) {
        setSyncBlock(DEFAULT_SYNC_BLOCK_STATE)
        return
      }

      const { toBlock, hasSyncToMinBlock, chunkIndex, tokenApprovals } =
        JSON.parse(storedItem)

      if (hasSyncToMinBlock) {
        setSyncBlock({
          // the previous value we've synced up to, is now the lower bound to review. The latest blockNumber will be the new toBlock
          chunkIndex: 0,
          fromBlock: toBlock + 1,
          hasSyncToMinBlock: false,
          toBlock: undefined,
          tokenApprovals
        })
        return
      }

      setSyncBlock(prev => ({
        ...prev,
        chunkIndex,
        toBlock,
        tokenApprovals
      }))
    },
    [localStorageKey, setSyncBlock]
  )

  // this effect takes care of syncing in chunks of ${BLOCK_NUMBER_WINDOW} size
  useEffect(
    function () {
      if (
        !localStorageKey ||
        !lastBlockNumber ||
        syncStatus !== SyncStatus.Syncing
      ) {
        return
      }

      const { fromBlock, toBlock, chunkIndex, hasSyncToMinBlock } = syncBlock

      const pivotBlock =
        hasSyncToMinBlock || !toBlock ? lastBlockNumber : toBlock
      const from = getPreviousFromBlock(pivotBlock, chunkIndex + 1, fromBlock)
      const to =
        getPreviousFromBlock(pivotBlock, chunkIndex, fromBlock) -
        (chunkIndex === 0 ? 0 : 1)
      if (to < from) {
        return
      }
      // eslint-disable-next-line no-console
      console.log(`syncing from blockNumber ${from} to blockNumber ${to}`)

      library.eth
        .getPastLogs({
          fromBlock: from,
          toBlock: to,
          topics: [
            APPROVAL_TOPIC,
            library.utils.padLeft(account?.toLowerCase(), 64)
          ]
        })
        .then(function (logs) {
          const newHasSyncToMinBlock = from <= fromBlock

          if (newHasSyncToMinBlock) {
            setSyncStatus(SyncStatus.Finished)
          }

          setSyncBlock(function (prev) {
            const newTokenApprovals = getNewestApprovals({
              library,
              logs: parseLogs(logs),
              tokenApprovals: prev.tokenApprovals
            })

            // sync to local storage
            localStorage.setItem(
              localStorageKey,
              JSON.stringify({
                chunkIndex: newHasSyncToMinBlock ? 0 : chunkIndex + 1,
                fromBlock: newHasSyncToMinBlock ? pivotBlock + 1 : fromBlock,
                hasSyncToMinBlock: newHasSyncToMinBlock,
                toBlock: pivotBlock,
                tokenApprovals: newTokenApprovals
              })
            )

            return {
              ...prev,
              chunkIndex: newHasSyncToMinBlock ? 0 : prev.chunkIndex + 1,
              fromBlock: newHasSyncToMinBlock ? pivotBlock + 1 : prev.fromBlock,
              hasSyncToMinBlock: newHasSyncToMinBlock,
              tokenApprovals: newTokenApprovals
            }
          })
        })
        .catch(function (err) {
          // eslint-disable-next-line no-console
          console.warn('Syncing failed:', err.message)
        })
    },
    [
      library,
      localStorageKey,
      account,
      syncBlock,
      setSyncBlock,
      setSyncStatus,
      lastBlockNumber,
      syncStatus
    ]
  )

  // this effect listens for new logs that take place while the user is syncing. This will make the ux smoother
  // though they won't be added to the sync process
  useEffect(
    function () {
      if (!active || !account) {
        return
      }

      const subscription = library.eth.subscribe('logs', {
        topics: [
          APPROVAL_TOPIC,
          library.utils.padLeft(account.toLowerCase(), 64)
        ]
      })

      subscription.on('data', function (log) {
        setSyncBlock(prev => ({
          ...prev,
          tokenApprovals: getNewestApprovals({
            library,
            logs: parseLogs([log]),
            tokenApprovals: prev.tokenApprovals
          })
        }))
      })

      return function () {
        subscription.unsubscribe()
      }
    },
    [active, library, account, chainId, setSyncBlock]
  )

  return { ...syncBlock, setSyncStatus, syncStatus }
}

const useErc20Token = function (address) {
  const { account, active, library } = useWeb3React()
  return useSWR(active ? `${account}:${address}` : null, function () {
    const erc20Service = createErc20(library, address)
    return Promise.all([
      erc20Service.symbol(),
      erc20Service.decimals(),
      erc20Service.totalSupply(),
      erc20Service.balanceOf(account)
    ]).then(([symbol, decimals, totalSupply, balance]) => ({
      balance,
      decimals,
      symbol,
      totalSupply
    }))
  })
}

const formatter = new Intl.NumberFormat('default', {
  maximumFractionDigits: 9,
  minimumFractionDigits: 6
})

const Allowance = function ({ address, data }) {
  const { library } = useWeb3React()
  const t = useTranslations()

  const { data: token } = useErc20Token(address)

  if (!token) {
    return <span className="m-auto" />
  }
  const { decimals, totalSupply } = token
  const allowanceInWei = library.utils.hexToNumberString(data)
  const value = new Big(fromUnit(allowanceInWei, decimals)).toNumber()
  const isUnlimited = new Big(allowanceInWei).gt(totalSupply)
  return (
    <span
      className="m-auto w-full whitespace-nowrap overflow-hidden overflow-ellipsis"
      title={formatter.format(value)}
    >
      {isUnlimited ? t('unlimited') : formatter.format(value)}
    </span>
  )
}

const Balance = function ({ address }) {
  const { data: token } = useErc20Token(address)
  if (!token) {
    return <span className="m-auto" />
  }
  const { decimals, balance } = token
  const color = balance === '0' ? 'text-gray-300' : ''
  return (
    <span className={color}>
      {formatter.format(new Big(fromUnit(balance, decimals)).toNumber())}
    </span>
  )
}

const Token = function ({ address }) {
  const { chainId } = useWeb3React()
  const { data: token } = useErc20Token(address)
  if (!token) {
    return <ExplorerLink address={address} chainId={chainId} />
  }
  const { symbol } = token
  return <ExplorerLink address={address} chainId={chainId} text={symbol} />
}

const TokenRevokes = function () {
  const { active } = useWeb3React()
  const { erc20 } = useContext(PureContext)
  const t = useTranslations()
  const [isRevoking, setIsRevoking] = useState(false)

  const { tokenApprovals, syncStatus, setSyncStatus } = useTokenApprovals()

  const handleRevoke = function (address, spender) {
    if (!active) {
      return
    }
    setIsRevoking(true)
    const erc20Service = erc20(address)
    erc20Service
      .revoke(spender)
      .then(() => setIsRevoking(false))
      .catch(() => setSyncStatus(SyncStatus.Error))
  }

  return (
    <Layout title={t('list-and-revoke-token-approvals')} walletConnection>
      <UtilFormBox
        className="md:w-200"
        title={t('list-and-revoke-token-approvals')}
      >
        {tokenApprovals.length > 0 && (
          <section className="flex flex-col overflow-x-auto">
            <div className="grid-cols-approval-sm md:grid-cols-approval grid gap-x-12 gap-y-5 place-content-center my-6">
              <span className="m-auto text-gray-600 font-bold">
                {t('token')}
              </span>
              <span className="hidden m-auto text-gray-600 font-bold md:block">
                {t('spender-address')}
              </span>
              <span className="m-auto text-gray-600 font-bold">
                {t('allowance')} / {t('balance')}
              </span>
              <span className="m-auto text-gray-600 font-bold">
                {t('actions')}
              </span>
              {tokenApprovals.map(
                ({ address, allowance, transactionHash, spender }) => (
                  <React.Fragment key={transactionHash}>
                    <Token address={address} />
                    <div className="hidden my-auto md:block">
                      <Token address={spender} />
                    </div>
                    <div className="my-auto">
                      <Allowance address={address} data={allowance} />
                      <span> / </span>
                      <Balance address={address} />
                    </div>
                    <Button
                      className="hidden md:block"
                      disabled={!active}
                      onClick={() => handleRevoke(address, spender)}
                      width="w-28"
                    >
                      {t('revoke')}
                    </Button>
                    <Button
                      className="flex justify-center mx-auto md:hidden"
                      disabled={!active}
                      onClick={() => handleRevoke(address, spender)}
                      width="w-10"
                    >
                      <svg
                        className="md:hidden"
                        height="18"
                        viewBox="0 0 18 18"
                        width="18"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"
                          fill="white"
                        />
                      </svg>
                    </Button>
                  </React.Fragment>
                )
              )}
            </div>
          </section>
        )}
        {!active && <h3>{t('connect-to-sync')}</h3>}
        {active && syncStatus === SyncStatus.Syncing && (
          <h3>{t('syncing-your-approvals')}</h3>
        )}
        {active && isRevoking && <h3>{t('revoking-approval')}</h3>}
        {syncStatus === SyncStatus.Error && <h3>{t('generic-error')}</h3>}
        {tokenApprovals.length === 0 && syncStatus === SyncStatus.Finished && (
          <p>{t('no-approvals')}</p>
        )}
      </UtilFormBox>
    </Layout>
  )
}

export { getStaticProps, getStaticPaths } from '../../utils/staticProps'
export default TokenRevokes
