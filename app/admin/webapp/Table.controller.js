sap.ui.define([
		'sap/m/MessageBox',
		'./Formatter',
		'sap/ui/core/mvc/Controller',
		'sap/ui/core/util/Export',
		'sap/ui/core/util/ExportTypeCSV',
		'sap/ui/model/json/JSONModel',
		'sap/ui/model/odata/v4/ODataModel'
	], function(MessageBox, Formatter, Controller, Export, ExportTypeCSV, JSONModel, ODataModel) {
	"use strict";

	var TableController = Controller.extend("sap.m.sample.TableExport.Table", {

		onInit : function() {
			// In order to use the mockdata uncomment the following two lines
			/*var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);*/
		},

		onDataExport : function(oEvent) {

			var oExport = new Export({

				// Type that will be used to generate the content. Own ExportType's can be created to support other formats
				exportType : new ExportTypeCSV({
					separatorChar : ";"
				}),

				// Pass in the model created above
				models : this.getOwnerComponent().getModel(),

				// binding information for the rows aggregation
				rows : {
					path : "/Products"
				},

				// column definitions with column name and binding info for the content

				columns : [{
					name : "Product",
					template : {
						content : "{Product}"
					}
				}, {
					name : "ProductID",
					template : {
						content : "{ProductID}"
					}
				}, {
					name : "Supplier",
					template : {
						content : "{Supplier}"
					}
				}, {
					name : "Dimensions",
					template : {
						content : "{Dimensions}"
					}
				}, {
					name : "Weight",
					template : {
						content : "{Weight}"
					}
				}, {
					name : "Price",
					template : {
						content : "{Price}"
					}
				}]
			});

			// download exported file
			oExport.saveFile().catch(function(oError) {
				MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
			}).then(function() {
				oExport.destroy();
			});
		}

	});


	return TableController;

});