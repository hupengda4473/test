'use strict';

const db = uniCloud.database();
const dbCmd = db.command
exports.main = async (event, context) => {

	var dbName = event.dbName //集合表名
	var lookup = event.lookup //集合表名
	var sort = event.sort ? event.sort : {} //排序
	var filter = event.filter ? event.filter : {} //筛选条件
	var pageIndex = event.pageIndex ? event.pageIndex : 1 //当前页数
	var pageSize = event.pageSize ? event.pageSize : 15 //每页数量


	let countResult = {}


	countResult = await db.collection(dbName).where(filter).count()

	const total = countResult.total //得到总记录数 
	const totalPage = Math.ceil(total / pageSize) //计算页数
	var hasMore //提示前端是否还有数据
	if (pageIndex > totalPage || pageIndex == totalPage) { //如果没有数据了，就返回false
		hasMore = false
	} else {
		hasMore = true
	}

	var result = {}

	if (sort) {
		result = await db.collection(dbName).aggregate()
			.match(filter)
			.skip((pageIndex - 1) * pageSize)
			.limit(pageSize)
			.sort(sort)
			.lookup(lookup)
			.end()
		
	} else {
		result = await db.collection(dbName).aggregate()
			.match(filter)
			.skip((pageIndex - 1) * pageSize)
			.limit(pageSize)
			.lookup(lookup)
			.end()
	}

	result.hasMore = hasMore

	return result
};
