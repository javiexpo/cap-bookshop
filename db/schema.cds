using {
  Currency,
  managed,
  sap
} from '@sap/cds/common';

namespace sap.capire.bookshop;

//sap.capire.bookshop-Products.csv
entity Products : managed {
  key ProductID  : String;
  Product    : String;
  Supplier   : String;
  Dimensions : String;
  Weight     : String;
  Price      : String;
}

/* entity Products : managed {
  key ID : Integer;
  ProductId : String;
 Category : String;
 MainCategory : String;
 TaxTarifCode : String;
 SupplierName : String;
 WeightMeasure : Decimal(13,2);
 WeightUnit : String(3);
 Description : String;
 Name : String;
 DateOfSale : String; //"2017-03-26",
 ProductPicUrl : String;
 Status : String;
 Quantity : Integer;
 UoM : String(5);
 CurrencyCode : String(3);
 Price : Decimal(13,2);
 Width : Integer;
 Depth : Integer;
 Height : Integer;
 DimUnit: Integer;
} */


entity Books : managed {
  key ID       : Integer;
      title    : localized String(111);
      descr    : localized String(1111);
      author   : Association to Authors;
      genre    : Association to Genres;
      stock    : Integer;
      price    : Decimal(9, 2);
      currency : Currency;
}

entity Authors : managed {
  key ID    : Integer;
      name  : String(111);
      books : Association to many Books
                on books.author = $self;
}

/** Hierarchically organized Code List for Genres */
entity Genres : sap.common.CodeList {
  key ID       : Integer;
      parent   : Association to Genres;
      children : Composition of many Genres
                   on children.parent = $self;
}
