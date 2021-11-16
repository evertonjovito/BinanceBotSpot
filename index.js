const api=require('./api')

const symbol=process.env.SYMBOL
const profitability=process.env.PROFITABILITY

setInterval(async()=>{
    console.log('Starting cycle...')

    const time=await api.time()
    console.log(`Server time: ${(time.serverTime)}`)

    console.log('Collecting wallet balance...')
    const account=await api.accountInfo()
    const coins=account.balances.filter(b=>symbol.indexOf(b.asset)!==-1)
    console.log('Wallet:')
    console.log(coins)

    const wUSDT=(coins.find(c=>c.asset==='USDT').free)

    console.log('Checking balance for trade (USDT>10.01)...')

    if(wUSDT>10.01){

        console.log('Available trade balance, taking market depth...')

        const result=await api.depth(symbol)
        if(result.asks && result.asks.length){
        sell=(parseFloat(result.asks[0][0]).toFixed(2))
        }
        console.log(`Sell: $ ${sell}`)
        if(result.bids&&result.bids.length){
        buy=(parseFloat(result.bids[0][0]).toFixed(2))
        }
        console.log(`Buy: $ ${buy}`)

        const qBTC=(0.00017)//Quando btc bater 100k mudar para 0.00010 dps 0.001 em 1kk
        const pbuyng=(qBTC*buy)

        console.log(`Checking balance for purchase $ ${pbuyng}`)

        if(wUSDT>pbuyng){
        console.log(`Avaliable balance`)
        console.log('Posting a market buy order...')

        console.log(`Shopping qBTC: ${qBTC}`)

        const buyOrder=await api.newOrder(symbol, qBTC)
        console.log(`OrderId: ${buyOrder.orderId}`)
        console.log(`Status: ${buyOrder.status}`);

        console.log('Posting a limit sell order...')

        const price=parseFloat(sell*profitability).toFixed(2)
        const sellOrder=await api.newOrder(symbol,(qBTC*0.999).toFixed(5),price,'SELL','LIMIT')
        console.log(`Amount qBTC: ${(qBTC*0.999).toFixed(5)}`)
        console.log(`Price: $ ${price}`)
        console.log(`OrderId: ${sellOrder.orderId}`)
        console.log(`Status: ${sellOrder.status}`)
        
        console.log('Finished cycle')
        }
        else{
        console.log(`No USDT balance to buy the amount of ${qBTC} BTC`)
        }
    }
    else{
        console.log(`(Balance = ${wUSDT} USDT). No balance available for trade (10.01 USDT), starting again...`)
    }
}, process.env.CRAWLER_INTERVAL)