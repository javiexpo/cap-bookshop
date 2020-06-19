sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/util/Export",
    "sap/ui/core/util/ExportTypeCSV",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Sorter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType",
    "./Formatter",
  ],
  function (
    Controller,
    MessageToast,
    MessageBox,
    Export,
    ExportTypeCSV,
    JSONModel,
    Sorter,
    Filter,
    FilterOperator,
    FilterType,
    Formatter
  ) {
    "use strict";

    return Controller.extend("sap.m.sample.TableExport.Table", {
      onInit: function () {
        // In order to use the mockdata uncomment the following two lines
        /*var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);*/

        var oMessageManager = sap.ui.getCore().getMessageManager(),
          oMessageModel = oMessageManager.getMessageModel(),
          oMessageModelBinding = oMessageModel.bindList(
            "/",
            undefined,
            [],
            new Filter("technical", FilterOperator.EQ, true)
          ),
          oViewModel = new JSONModel({
            busy: false,
            hasUIChanges: false,
            order: 0,
          });
        this.getView().setModel(oViewModel, "appView");
        this.getView().setModel(oMessageModel, "message");

        oMessageModelBinding.attachChange(this.onMessageBindingChange, this);
        this._bTechnicalErrors = false;
      },

      onMessageBindingChange: function (oEvent) {
        var aContexts = oEvent.getSource().getContexts(),
          aMessages,
          bMessageOpen = false;

        if (bMessageOpen || !aContexts.length) {
          return;
        }

        // Extract and remove the technical messages
        aMessages = aContexts.map(function (oContext) {
          return oContext.getObject();
        });
        sap.ui.getCore().getMessageManager().removeMessages(aMessages);

        this._setUIChanges(true);
        this._bTechnicalErrors = true;
        MessageBox.error(aMessages[0].message, {
          id: "serviceErrorMessageBox",
          onClose: function () {
            bMessageOpen = false;
          },
        });

        bMessageOpen = true;
      },

      onCreateProduct: function (oEvent) {
        var productPayload = {
          productID: "NP-1",
          product: "New Product 1",
          supplier: "Javier Exposito",
          dimensions: "30 x 18 x 3 cm",
          weight: "1.5 KG",
          price: "1000 EUR",
        };

        var oTable = this.byId("idProductsTable");
        var oBinding = oTable.getBinding("items");
        var oContext = oBinding.create(productPayload);
        this._setUIChanges(true);
      },

      onDeleteProduct: function (oEvent) {
        var oSelected = this.byId("idProductsTable").getSelectedItem();

        if (oSelected) {
          oSelected
            .getBindingContext()
            .delete("$auto")
            .then(
              function () {
                MessageToast.show(this._getText("deletionSuccessMessage"));
              }.bind(this),
              function (oError) {
                MessageBox.error(oError.message);
              }
            );
        } else {
			MessageBox.error(this._getText("noProductLineSelected"))
		}
      },

      onEditPriceWithAction: function (oEvent) {
		var oModel = this.getView().getModel();
        //var oOperation = oModel.bindContext("/changeProducPrice(...)");
		
		var oSelected = this.byId("idProductsTable").getSelectedItem();
		if(!oSelected){
			MessageBox.error(this._getText("noProductLineSelected"))
			return;
		}

		var oOperation = oSelected.getModel().bindContext("/changeProducPrice(...)");
		var productId = oSelected.getBindingContext().getValue("productID");
		oOperation.setParameter("productId", productId);
		oOperation.setParameter("newPrice", "1982.00 USD");
		
        oOperation.execute().then(
          function () {
            oModel.refresh();
            MessageToast.show(this._getText("changeProducPriceSuccess"));
          }.bind(this),
          function (oError) {
            MessageBox.error(oError.message);
          }
        );
      },

      /**
       * Refresh the data.
       */
      onRefresh: function () {
        var oBinding = this.byId("idProductsTable").getBinding("items");

        if (oBinding.hasPendingChanges()) {
          MessageBox.error(this._getText("refreshNotPossibleMessage"));
          return;
        }
        oBinding.refresh();
        MessageToast.show(this._getText("refreshSuccessMessage"));
      },

      /**
       * Reset any unsaved changes.
       */
      onResetChanges: function () {
        this.byId("idProductsTable").getBinding("items").resetChanges();
        this._bTechnicalErrors = false; // If there were technical errors, cancelling changes resets them.
        this._setUIChanges(false);
      },

      /**
       * Save changes to the source.
       */
      onSave: function () {
        var fnSuccess = function () {
          this._setBusy(false);
          MessageToast.show(this._getText("changesSentMessage"));
          this._setUIChanges(false);
        }.bind(this);

        var fnError = function (oError) {
          this._setBusy(false);
          this._setUIChanges(false);
          MessageBox.error(oError.message);
        }.bind(this);

        this._setBusy(true); // Lock UI until submitBatch is resolved.
        this.getView()
          .getModel()
          .submitBatch("productGroup")
          .then(fnSuccess, fnError);
        this._bTechnicalErrors = false; // If there were technical errors, a new save resets them.
      },

      onDataExport: function (oEvent) {
        var oExport = new Export({
          // Type that will be used to generate the content. Own ExportType's can be created to support other formats
          exportType: new ExportTypeCSV({
            separatorChar: ";",
          }),

          // Pass in the model created above
          models: this.getOwnerComponent().getModel(),

          // binding information for the rows aggregation
          rows: {
            path: "/Products",
          },

          // column definitions with column name and binding info for the content

          columns: [
            {
              name: "Product",
              template: {
                content: "{Product}",
              },
            },
            {
              name: "ProductID",
              template: {
                content: "{ProductID}",
              },
            },
            {
              name: "Supplier",
              template: {
                content: "{Supplier}",
              },
            },
            {
              name: "Dimensions",
              template: {
                content: "{Dimensions}",
              },
            },
            {
              name: "Weight",
              template: {
                content: "{Weight}",
              },
            },
            {
              name: "Price",
              template: {
                content: "{Price}",
              },
            },
          ],
        });

        // download exported file
        oExport
          .saveFile()
          .catch(function (oError) {
            MessageBox.error(
              "Error when downloading data. Browser might not be supported!\n\n" +
                oError
            );
          })
          .then(function () {
            oExport.destroy();
          });
      },

      /**
       * Convenience method for retrieving a translatable text.
       * @param {string} sTextId - the ID of the text to be retrieved.
       * @param {Array} [aArgs] - optional array of texts for placeholders.
       * @returns {string} the text belonging to the given ID.
       */
      _getText: function (sTextId, aArgs) {
        return this.getOwnerComponent()
          .getModel("i18n")
          .getResourceBundle()
          .getText(sTextId, aArgs);
      },

      /**
       * Set hasUIChanges flag in View Model
       * @param {boolean} [bHasUIChanges] - set or clear hasUIChanges
       * if bHasUIChanges is not set, the hasPendingChanges-function of the OdataV4 model determines the result
       */
      _setUIChanges: function (bHasUIChanges) {
        if (this._bTechnicalErrors) {
          // If there is currently a technical error, then force 'true'.
          bHasUIChanges = true;
        } else if (bHasUIChanges === undefined) {
          bHasUIChanges = this.getView().getModel().hasPendingChanges();
        }
        var oModel = this.getView().getModel("appView");
        oModel.setProperty("/hasUIChanges", bHasUIChanges);
      },

      /**
       * Set busy flag in View Model
       * @param {boolean} bIsBusy - set or clear busy
       */
      _setBusy: function (bIsBusy) {
        var oModel = this.getView().getModel("appView");
        oModel.setProperty("/busy", bIsBusy);
      },
    });
  }
);
