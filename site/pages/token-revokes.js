import { useWeb3React } from '@web3-react/core'
import React, { useState, useEffect, useContext } from 'react'
import useTranslation from 'next-translate/useTranslation'
import useSWR from 'swr'
import Big from 'big.js'
import createErc20 from 'erc-20-lib'
import Layout from '../components/Layout'
import Button from '../components/Button'
import { EtherscanLink } from '../components/EtherscanLink'
import { fromUnit, toFixed } from '../utils'
import PureContext from '../components/context/Pure'

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

const parseLogs = (logs) =>
  logs.map(({ address, blockNumber, data, transactionHash, topics }) => ({
    address,
    blockNumber,
    allowance: data,
    transactionHash,
    spender: topics[2]
  }))

const unpad = (string) => string.replace(/0{24}/, '')

const SyncStatus = {
  Error: 0,
  Syncing: 1,
  Finished: 2
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
          (tokenApproval) =>
            tokenApproval.spender === spender &&
            tokenApproval.address === address
        )
        .concat(
          logs.filter(
            (log) => log.spender === spender && log.address === address
          )
        )
        .sort((a, b) => b.blockNumber - a.blockNumber)

      const newestOperation = allOperations[0]
      if (library.utils.hexToNumberString(newestOperation.allowance) === '0') {
        // last operation was a revoke, so we return nothing
        return
      }
      return newestOperation
    })
    .filter(Boolean) // remove empties
}

const DEFAULT_SYNC_BLOCK_STATE = {
  fromBlock: MIN_BLOCK_TO_SYNC,
  toBlock: undefined,
  hasSyncToMinBlock: false,
  chunkIndex: 0,
  tokenApprovals: []
}

function useTokenApprovals() {
  const { active, library, account, chainId } = useWeb3React()
  const [syncBlock, setSyncBlock] = useState(DEFAULT_SYNC_BLOCK_STATE)

  const [syncStatus, setSyncStatus] = useState(SyncStatus.Syncing)

  const { data: lastBlockNumber } = useLastBlockNumber()
  const localStorageKey =
    chainId && account ? `pf-token-approvals-sync-${chainId}-${account}` : null

  // this effect takes care of loading the restore point of sync process
  // or seting the initial data if syncing for the first time
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

      const {
        toBlock,
        hasSyncToMinBlock,
        chunkIndex,
        tokenApprovals
      } = JSON.parse(storedItem)

      if (hasSyncToMinBlock) {
        setSyncBlock({
          // the previous value we've synced up to, is now the lower bound to review. The latest blockNumber will be the new toBlock
          fromBlock: toBlock + 1,
          tokenApprovals,
          toBlock: undefined,
          chunkIndex: 0,
          hasSyncToMinBlock: false
        })
        return
      }

      setSyncBlock((prev) => ({
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
      console.log(`syncing from blockNumber ${from} to blockNumber ${to}`)

      library.eth
        .getPastLogs({
          fromBlock: from,
          toBlock: to,
          topics: [
            APPROVAL_TOPIC,
            library.utils.padLeft(account.toLowerCase(), 64)
          ]
        })
        .then(function (logs) {
          const newHasSyncToMinBlock = from <= fromBlock

          if (newHasSyncToMinBlock) {
            setSyncStatus(SyncStatus.Finished)
          }

          setSyncBlock((prev) => {
            const newTokenApprovals = getNewestApprovals({
              logs: parseLogs(logs),
              tokenApprovals: prev.tokenApprovals,
              library
            })

            // sync to local storage
            localStorage.setItem(
              localStorageKey,
              JSON.stringify({
                fromBlock: newHasSyncToMinBlock ? pivotBlock + 1 : fromBlock,
                toBlock: pivotBlock,
                chunkIndex: newHasSyncToMinBlock ? 0 : chunkIndex + 1,
                tokenApprovals: newTokenApprovals,
                hasSyncToMinBlock: newHasSyncToMinBlock
              })
            )

            return {
              ...prev,
              fromBlock: newHasSyncToMinBlock ? pivotBlock + 1 : prev.fromBlock,
              chunkIndex: newHasSyncToMinBlock ? 0 : prev.chunkIndex + 1,
              hasSyncToMinBlock: newHasSyncToMinBlock,
              tokenApprovals: newTokenApprovals
            }
          })
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
      if (!active) {
        return
      }

      const subscription = library.eth.subscribe('logs', {
        topics: [
          APPROVAL_TOPIC,
          library.utils.padLeft(account.toLowerCase(), 64)
        ]
      })

      subscription.on('data', function (log) {
        setSyncBlock((prev) => ({
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

  return { ...syncBlock, syncStatus: syncStatus, setSyncStatus }
}

const useErc20Token = function (address) {
  const { active, library } = useWeb3React()
  return useSWR(active ? address : null, function () {
    const erc20Service = createErc20(library, address)
    return Promise.all([
      erc20Service.symbol(),
      erc20Service.decimals(),
      erc20Service.totalSupply()
    ])
  })
}

const Allowance = function ({ address, data }) {
  const { library } = useWeb3React()
  const { t } = useTranslation('common')

  const { data: token } = useErc20Token(address)

  if (!token) {
    return <span className="m-auto"></span>
  }
  const [, decimals, totalSupply] = token
  const allowanceInWei = library.utils.hexToNumberString(data)
  const value = toFixed(fromUnit(allowanceInWei, decimals), 6)
  const isUnlimited = Big(totalSupply).times(10).lt(allowanceInWei)
  return <span className="m-auto">{isUnlimited ? t('unlimited') : value}</span>
}

const Token = function ({ address }) {
  const { data: token } = useErc20Token(address)
  if (!token) {
    return <span className="m-auto"></span>
  }
  const [symbol] = token
  return <span className="m-auto">{symbol}</span>
}

const TokenRevokes = function () {
  const { active } = useWeb3React()
  const { erc20 } = useContext(PureContext)
  const { t } = useTranslation('common')
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
    <Layout walletConnection>
      {!active && <h3>{t('connect-to-sync')}</h3>}
      {active && syncStatus === SyncStatus.Syncing && (
        <h3>{t('syncing-your-approvals')}</h3>
      )}
      {active && isRevoking && <h3>{t('revoking-approval')}</h3>}
      {syncStatus === SyncStatus.Error && <h3>{t('generic-error')}</h3>}
      {tokenApprovals.length === 0 && syncStatus === SyncStatus.Finished && (
        <p>{t('no-approvals')}</p>
      )}
      {tokenApprovals.length > 0 && (
        <section className="flex flex-col overflow-x-auto">
          <h3 className="font-bold text-center text-gray-600">
            {t('approvals')}
          </h3>
          <div className="my-6 grid grid-cols-approval place-content-center gap-y-5 gap-x-12">
            <span className="m-auto">{t('token')}</span>
            <span className="m-auto">{t('spender-address')}</span>
            <span className="m-auto">{t('allowance')}</span>
            <span></span>
            {tokenApprovals.map(
              ({ address, allowance, transactionHash, spender }) => (
                <React.Fragment key={transactionHash}>
                  <Token address={address} />
                  <EtherscanLink address={unpad(spender)} />
                  <Allowance address={address} data={allowance} />
                  <Button
                    disabled={!active}
                    onClick={() => handleRevoke(address, unpad(spender))}
                    width="28"
                  >
                    {t('revoke')}
                  </Button>
                </React.Fragment>
              )
            )}
          </div>
        </section>
      )}
    </Layout>
  )
}

export default TokenRevokes
