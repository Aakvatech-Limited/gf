frappe.listview_settings["Assembly Job Card"] = {
	add_fields: ["status"],
	get_indicator: function (doc) {
		if (doc.status == "Pending") {
			return [__("Pending"), "orange", "status,=," + "Pending"];
		}

		if (doc.status == "Assembly") {
			return [__("Assembly"), "cyan", "status,=," + "Assembly"];
		}

		if (doc.status == "Cabinet") {
			return [__("Cabinet"), "light blue", "status,=," + "Cabinet"];
		}

		if (doc.status == "Bodyshop") {
			return [__("Bodyshop"), "yellow", "status,=," + "Bodyshop"];
		}

		if (doc.status == "Sickbay") {
			return [__("Sickbay"), "yellow", "status,=," + "Sickbay"];
		}
        
		if (doc.status == "QC") {
			return [__("QC"), "blue", "status,=," + "QC"];
		}

		if (doc.status == "Completed") {
			return [__("Completed"), "green", "status,=," + "Completed"];
		}
	},
};
