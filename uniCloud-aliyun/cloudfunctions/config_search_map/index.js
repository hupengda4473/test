'use strict';
const db = uniCloud.database();
const dbCmd = db.command;
exports.main = async (event, context) => {

	var keys = event.keys
	var result_map = {}
	let result = await db.collection('wx_config').where({
		'key': dbCmd.in(keys)
	}).get()
	for (var i = 0; i < result.data.length; i++) {
		if(result.data[i].val){
			result_map[result.data[i].key] = result.data[i].val
		}
	}
	return {
		success: true,
		data: result_map
	}
};
