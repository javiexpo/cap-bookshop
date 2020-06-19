using { sap.capire.bookshop as my } from '../db/schema';

service AdminService @(_requires:'authenticated-user') {
  entity Books as projection on my.Books;
  entity Authors as projection on my.Authors;
  entity Products as projection on my.Products;

  @requires_: 'authenticated-user'
  action changeProducPrice (productId : Products.productID, newPrice: String);

}

annotate AdminService.Authors with @(restrict: [
  {grant: 'READ', to: 'admin'}
]);


