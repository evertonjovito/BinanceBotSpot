const api=require('./api')
//
const symbol=process.env.SYMBOL
const profitability=process.env.PROFITABILITY
//
setInterval(async()=>{
    //
    console.log('Starting cycle...')
    //
    const time=await api.time()
    console.log(`Server time: ${(time.serverTime)}`)
    //
    console.log('Collecting wallet balance...')
    const account=await api.accountInfo()
    const coins=account.balances.filter(b=>symbol.indexOf(b.asset)!==-1)
    console.log('Wallet:')
    console.log(coins)
    //
    const wUSDT=(coins.find(c=>c.asset==='USDT').free)
    //
    console.log('Checking balance for trade (USDT>100.1)...')
    //
    if(wUSDT>100.1){
        //
        console.log('Available trade balance, taking market depth...')
        //
        const result=await api.depth(symbol)
        if(result.asks && result.asks.length){
        sell=(parseFloat(result.asks[0][0]).toFixed(2))
        }
        console.log(`Sell: $${sell}`)
        if(result.bids&&result.bids.length){
        buy=(parseFloat(result.bids[0][0]).toFixed(2))
        }
        console.log(`Buy: $${buy}`)
        //
        const qBTC=((((wUSDT/sell)*0.1).toFixed(5)))
        const pbuyng=(((qBTC*sell).toFixed(2)))
        //
        console.log(`Purchase (${pbuyng} USDT) (${qBTC} BTC)`)
        //
        console.log('Posting a market buy order...')
        //
        console.log(`Shopping qBTC: ${qBTC}`)
        const buyOrder=await api.newOrder(symbol,qBTC)
        console.log(`OrderId: ${buyOrder.orderId}`)
        console.log(`Status: ${buyOrder.status}`);
        //
        console.log('Posting a limit sell order...')
        //
        const price=parseFloat(sell*profitability).toFixed(2)
        const sellOrder=await api.newOrder(symbol,qBTC,price,'SELL','LIMIT')
        console.log(`Amount qBTC: ${qBTC}`)
        console.log(`Price: $${price}`)
        console.log(`OrderId: ${sellOrder.orderId}`)
        console.log(`Status: ${sellOrder.status}`)
        //
        console.log('Finished cycle')
        //
    }
    else{
        console.log(`(Balance = ${wUSDT} USDT). No balance available for trade (100.1 USDT), starting again...`)
    }
}, process.env.CRAWLER_INTERVAL)