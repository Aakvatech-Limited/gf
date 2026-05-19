// Auto-populate Sales Order items from a GFA Batch No.
// For every finished-truck Serial No (gfa_item_type='Chs/Eng') belonging to
// the batch, add one row to items: item_code = selling_item, qty = 1,
// serial_no = the truck's Serial No, description = chassis_no.
frappe.ui.form.on('Sales Order', {
    gfa_batch_no: function (frm) {
        if (!frm.doc.gfa_batch_no) {
            return;
        }

        frappe.call({
            method: 'gf.api.api.get_items_from_gfa_batch_no',
            args: { gfa_batch_no: frm.doc.gfa_batch_no },
            freeze: true,
            freeze_message: __('Fetching trucks from GFA Batch...'),
            callback: function (r) {
                if (!r.message) {
                    return;
                }

                const payload = r.message;
                const items = payload.items || [];

                if (payload.total_serials_found === 0) {
                    frappe.msgprint(
                        __('No finished trucks (Chs/Eng) found for GFA Batch {0}.',
                            [frm.doc.gfa_batch_no])
                    );
                    return;
                }

                if (items.length === 0) {
                    frappe.msgprint(
                        __('Found {0} truck(s) for batch {1}, but none have a Selling Item set on the Serial No.',
                            [payload.total_serials_found, frm.doc.gfa_batch_no])
                    );
                    return;
                }

                frm.clear_table('items');

                // For each truck, add a row and then set item_code via
                // frappe.model.set_value so ERPNext's item handler fills in
                // rate/item_name/etc. After that resolves, override
                // description with the chassis_no.
                const promises = items.map(function (item) {
                    const row = frm.add_child('items');
                    return frappe.model.set_value(row.doctype, row.name, 'item_code', item.item_code)
                        .then(function () {
                            return frappe.model.set_value(row.doctype, row.name, {
                                qty: item.qty,
                                uom: item.uom,
                                serial_no: item.serial_no,
                                description: item.description,
                            });
                        });
                });

                Promise.all(promises).then(function () {
                    frm.refresh_field('items');

                    const trucks_used = items.length;
                    let msg = __('Loaded {0} truck(s) from batch {1}.',
                        [trucks_used, frm.doc.gfa_batch_no]);
                    if (payload.skipped_serials_without_selling_item.length > 0) {
                        msg += '<br>' + __('Skipped {0} truck(s) with no Selling Item: {1}',
                            [
                                payload.skipped_serials_without_selling_item.length,
                                payload.skipped_serials_without_selling_item.join(', ')
                            ]);
                    }
                    frappe.show_alert({ message: msg, indicator: 'green' }, 7);
                });
            }
        });
    }
});
