sap.ui.define(['sap/ui/core/UIComponent','sap/m/sample/TableExport/model/models'],
	function(UIComponent, models) {
	"use strict";

	return UIComponent.extend("sap.m.sample.TableExport.Component", {
		metadata : {
			manifest: "json"
		},

		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
		}
	});
});
