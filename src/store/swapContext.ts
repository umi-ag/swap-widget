import { useEffect } from 'react';
import { useBalance } from '../hooks/balance';
import { useCoinList } from '../hooks/coinList';
import { useQuoteApi, useQuoteQuery } from '../hooks/quoteApi';
import type { UmiTerminalProps } from '../type';
import { useCoinStore } from './coin';
import { useConfigStore } from './config';
import Decimal from 'decimal.js';

export type SwapContextProps = Pick<UmiTerminalProps, 'accountAddress' | 'provider'>;

export const useSwapContext = ({
  accountAddress,
  provider,
}: SwapContextProps) => {
  const configStore = useConfigStore();
  const chain = configStore.chain;

  const coinStore = useCoinStore();
  if (coinStore.sourceCoin === null || coinStore.targetCoin === null) {
    coinStore.initCoins(chain);
  }

  const { coinList } = useCoinList({ chain });
  const { balances, mutate: reloadBalances } = useBalance({ chain, accountAddress, provider });

  const { quoteQuery, setQuoteQuery } = useQuoteQuery({
    sourceAmount: 0,
    sourceCoin: coinStore.sourceCoin?.coinType ?? '',
    targetCoin: coinStore.targetCoin?.coinType ?? '',
  });
  useEffect(() => {
    const sourceAmount = new Decimal(coinStore.sourceVolume)
      .mul(10 ** (coinStore.sourceCoin?.decimals ?? 0))
      .toNumber();
    setQuoteQuery({
      ...quoteQuery,
      sourceCoin: coinStore.sourceCoin?.coinType ?? '',
      targetCoin: coinStore.targetCoin?.coinType ?? '',
      sourceAmount,
    });
  }, [coinStore.sourceCoin, coinStore.targetCoin, coinStore.sourceVolume]);

  const { quote, mutate: reloadQuote } = useQuoteApi({ chain, quoteQuery });

  return {
    ...configStore,
    ...coinStore,
    setSourceCoin: (coinType: string) => coinStore.setSourceCoin(coinList, coinType),
    setTargetCoin: (coinType: string) => coinStore.setTargetCoin(coinList, coinType),
    maxSourceVolume: () => coinStore.maxSourceVolume(balances),
    sourceCoinBalance: () => coinStore.sourceCoinBalance(balances),
    get targetVolume() {
      return new Decimal(quote?.target_amount ?? 0)
        .div(10 ** (coinStore.targetCoin?.decimals ?? 0))
        .toFixed(coinStore.targetCoin?.decimals ?? 0);
    },
    coinList,
    balances,
    reloadBalances,
    quoteQuery,
    setQuoteQuery,
    quote,
    reloadQuote,
  };
};

// type State = {
//   chain: Chain;

//   // quoteQuery: QuoteQuery;
//   // coinList: CoinProfile[];
//   // balances: CoinBalance[];
//   // quote: TradingRoute | null;
//   // coinListQuery: ReturnType<typeof useCoinList>;
//   // balanceQuery: ReturnType<typeof useBalance>;
//   // quoteApiQuery: ReturnType<typeof useQuoteApi>;
// };

// type Action = {
//   setChain: (chain: Chain) => void;
//   setSourceCoin: (coinList: CoinProfile[], coinType: string) => void;
//   setTargetCoin: (coinList: CoinProfile[], coinType: string) => void;
//   switchCoin: () => void;
//   setSourceVolume: (volume: number) => void;
//   maxSourceVolume: (balances: CoinBalance[]) => void;
//   currentBalance: (balances: CoinBalance[]) => number | undefined;
//   setQuoteQuery: (quoteQuery: QuoteQuery) => void;
//   routeDigest: (quote: TradingRoute) => string | undefined;
//   reloadBalances: () => Promise<void>;
//   reloadQuote: () => Promise<void>;
// };

// export type TradeContextProps = State & Action;

// // export const useTradeContext = create<TradeContextProps>()((set, get) => {
// //   // const { provider, accountAddress } = useUserContext();

// //   const chain = 'sui';

// //   // const balanceQuery = useBalance({ chain, });
// //   // const { balances, mutate: mutateBalances } = balanceQuery;
// //   // const coinListQuery = useCoinList({ chain });
// //   // const { coinList } = coinListQuery;

// //   const initialCoin = initialCoinSelection[chain];

// //   // const { quoteQuery, setQuoteQuery } = useQuoteQuery({
// //   //   sourceAmount: 0,
// //   //   sourceCoin: initialCoin.source.coinType,
// //   //   targetCoin: initialCoin.target.coinType,
// //   // });

// //   const setQuoteQuery = (quoteQuery: QuoteQuery) => {
// //     set({
// //       quoteQuery,
// //     });
// //   };

// //   // const { quote, mutate: mutateQuote } = useQuoteApi({
// //   //   chain,
// //   //   quoteQuery,
// //   // });

// //   const setChain = (chain: Chain) => {
// //     set({
// //       chain,
// //       sourceCoin: initialCoinSelection[chain].source,
// //       targetCoin: initialCoinSelection[chain].target,
// //     });
// //     setQuoteQuery({
// //       ...get().quoteQuery,
// //       sourceCoin: initialCoinSelection[chain].source.coinType,
// //       targetCoin: initialCoinSelection[chain].target.coinType,
// //     });
// //   };

// //   const setSourceCoin = (coinList: CoinProfile[], coinType: string) => {
// //     const coin = coinList.find(coin => coin.coinType === coinType);
// //     if (!coin) return;
// //     set({
// //       sourceCoin: coin,
// //     });
// //     setQuoteQuery({
// //       ...get().quoteQuery,
// //       sourceAmount: new Decimal(get().sourceVolume).mul(10 ** coin.decimals).toNumber(),
// //       sourceCoin: coin.coinType,
// //     });
// //   };

// //   const setTargetCoin = (coinList: CoinProfile[], coinType: string) => {
// //     const coin = coinList.find(coin => coin.coinType === coinType);
// //     if (!coin) return;
// //     set({
// //       targetCoin: coin,
// //     });
// //     setQuoteQuery({
// //       ...get().quoteQuery,
// //       targetCoin: coin.coinType,
// //     });
// //   };

// //   const switchCoin = () => {
// //     const { sourceCoin, targetCoin, sourceVolume } = get();
// //     set({
// //       sourceCoin: targetCoin,
// //       targetCoin: sourceCoin,
// //     });
// //     setQuoteQuery({
// //       ...get().quoteQuery,
// //       sourceAmount: new Decimal(sourceVolume)
// //         .mul(10 ** targetCoin.decimals)
// //         .toNumber(),
// //       sourceCoin: targetCoin.coinType,
// //       targetCoin: sourceCoin.coinType,
// //     });
// //   };

// //   const setSourceVolume = (volume: number) => {
// //     console.log({ volume });

// //     set({
// //       sourceVolume: volume,
// //     });
// //     setQuoteQuery({
// //       ...get().quoteQuery,
// //       sourceAmount: new Decimal(volume)
// //         .mul(10 ** get().sourceCoin.decimals)
// //         .toNumber(),
// //     });

// //     console.log(get());
// //   };

// //   const maxSourceVolume = (balances: CoinBalance[]) => {
// //     const sourceVolume = balances.find(balance => balance.coinType === get().sourceCoin.coinType)
// //       ?.totalBalance
// //       .div(10 ** get().sourceCoin.decimals)
// //       .toNumber();

// //     if (!sourceVolume) return;
// //     setSourceVolume(sourceVolume);
// //   };

// //   const currentBalance = (balances: CoinBalance[]) => {
// //     const balance = balances.find(balance => balance.coinType === get().sourceCoin.coinType)
// //       ?.totalBalance;

// //     if (!balance) return;
// //     return balance
// //       .div(10 ** get().sourceCoin.decimals)
// //       .toNumber();
// //   };

// //   const routeDigest = (quote: TradingRoute) => {
// //     // const quote = quoteApiQuery.quote;
// //     if (!quote) return;
// //     const venues = [...new Set(quote.paths
// //       .flatMap(p => p.path.steps
// //         .flatMap(s => s.venues
// //           .flatMap(v => v.venue.name)))),
// //     ];
// //     const venuesCount = venues.length;
// //     const venueNames = venues.join(', ');
// //     return `Swap via ${venuesCount} venue${venuesCount > 1 ? 's' : ''}: ${venueNames}`;
// //   };

// //   const reloadBalances = async () => {
// //     // await mutateBalances();
// //   };

// //   const reloadQuote = async () => {
// //     // await mutateQuote();
// //   };

// //   return {
// //     chain,
// //     // coinListQuery,
// //     // balanceQuery,
// //     // quoteApiQuery,
// //     sourceCoin: initialCoin.source,
// //     targetCoin: initialCoin.target,
// //     sourceVolume: 0,
// //     targetVolume: 0,
// //     coinList: [],
// //     balances: [],
// //     quote: null,
// //     reloadBalances,
// //     reloadQuote,
// //     quoteQuery: {
// //       sourceAmount: 0,
// //       sourceCoin: initialCoin.source.coinType,
// //       targetCoin: initialCoin.target.coinType,
// //     },
// //     setChain,
// //     setSourceCoin,
// //     setTargetCoin,
// //     switchCoin,
// //     setSourceVolume,
// //     maxSourceVolume,
// //     currentBalance,
// //     setQuoteQuery,
// //     routeDigest,
// //   };
// // });