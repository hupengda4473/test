'use strict';
const db = uniCloud.database();
exports.main = async (event, context) => {
	var authorizationRes = true
	var dbName = event.dbName
	var filter = event.filter ? event.filter : {} //筛选条件
	var pageSize = event.pageSize ? event.pageSize : 5 //每页数量
	var data = {}
	let result = await db.collection(dbName).aggregate().match(filter).sample({size: pageSize}).end()
	
	if(result.data.length > 0){
		data = result.data
	}
	return data
};
