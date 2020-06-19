const cds = require('@sap/cds')
module.exports = async function (){

  const db = await cds.connect.to('db') // connect to database service
  const { Products } = db.entities         // get reflected definitions

  // Reduce stock of ordered books if available stock suffices
  this.on ('changeProducPrice', async req => {
    const {productId, newPrice} = req.data
    const n = await UPDATE (Products).set({
        price:newPrice
    }).where ({productID:productId})
  })

}