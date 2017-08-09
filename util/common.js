exports.numberWithCommas= function(x){
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

exports.getKeySymbol = function(marketName, separator){
    let keys = marketName.split(separator)
    return keys[0]
}