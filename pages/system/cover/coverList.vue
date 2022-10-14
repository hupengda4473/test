<template>
	<view  v-if="vuex_user.system == 1">
		<view class="menu u-m-l-30 u-m-r-30">
			<u-tabs :list="tagList" :is-scroll="false" active-color="#ffc106" :current="tagCurrent" @change="cateClick"></u-tabs>
		</view>
		<view class="" style="padding-top: 80rpx;">
			<u-search @clear="getCoverList(tagCurrent, 1)" @search="searchClick" placeholder="输入搜索内容" shape="round" v-model="searchKeyWord" :show-action="false" :animation="true"></u-search>
			
			<view  v-for="(item, index) in coverList" :key="index"  @click="detailCheckedClick(index)">
				<u-gap height="15" bg-color="#F5F6F8"></u-gap>
				<view class="u-flex u-row-left u-col-top u-p-l-40 u-p-r-40 u-p-t-20 u-p-b-10" :style="item.checked?'background-color: #fffdde;':''">
					<view class="tab"  @click="detailClick(item._id)">
						<image :src="vuex_compressPicture?item.image+'?x-oss-process=image/resize,w_200/quality,q_60':item.image" style="width: 180rpx;height: 250rpx;" mode="aspectFill" :lazy-load="true"></image>
					</view>
					<view class="btns u-flex-col u-row-between u-p-l-20 u-p-t-10">
						<view class="">
							<view class="title u-font-16 u-line-1">
								{{item.name}}
							</view>
							<view class="">
								<!-- <view class="u-tips-color u-p-t-10 u-font-12">
									类型：{{item.mode==0?'壁纸':'头像'}}
								</view> -->
								<view class="u-tips-color u-p-t-10 u-font-12">
									分类：{{item.category_name}}
								</view>
								<view class="u-tips-color u-p-t-10 u-font-12">
									数量：{{item.images.length}}
								</view>
								<view class="u-tips-color u-p-t-10 u-font-12" v-if="item.tags">
									标签：{{item.tags}}
								</view>
							</view>
							<view class="" v-if="item.status === 2">
								<view class="bohui u-tips-color u-p-t-10 u-font-12">
									驳回原因：<text>{{item.examine}}</text>
								</view>
							</view>
						</view>
						<view class="u-flex u-row-right">
							<view v-if="item.status == 1" class="tags tag-active u-m-r-20" @click.stop="editChange(item._id, 3)">下架</view>
							<view v-if="item.status == 3" class="tags tag-active u-m-r-20" @click.stop="editChange(item._id, 1)">上架</view>
							<view v-if="item.status == 0" class="tags tag-active u-m-r-20" @click.stop="editChange(item._id, 1)">通过</view>
							<view v-if="item.status == 0||item.status == 1 || item.status == 2" class="tags tag-active u-m-r-20" @click.stop="editClick(item._id)">编辑</view>
							<view v-if="item.status == 0" class="tags tag-actives no_active_ u-m-r-20" @click.stop="editChange(item._id, 2)">驳回</view>
							<view v-if="item.status == 1 || item.status == 2" class="tags" @click.stop="delClick(item._id)">删除</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view v-if="noData"
		class="u-flex u-flex-col u-col-center"
		style="width: 100vw;height: 50vh;padding-top: 200rpx;background-color: #FFFFFF;">
			<view class="">
				<image style="width: 300rpx;height: 300rpx;" src="/static/nodata.png"></image>
			</view>
			<view class="u-tips-color u-font-12 u-p-t-30">
				没有数据哦~
			</view>
		</view>
		
		<view class="" v-if="!noData">
			<u-loadmore :status="loadStatus" :font-size="24" :margin-top="30" :margin-bottom="30" color="#B8B8B8"/>
		</view>
		<view class="safe-area-inset-bottom">
			<view class="" style="height: 1px;"></view>
		</view>
		
		<u-modal ref="uModal" v-model="editShow" title="填写驳回原因" :show-cancel-button="true" confirm-text="提交" confirm-color="#fcc600" content="content" :async-close="true"  @confirm="editChange">
			<view class="u-p-40">
				<view class="">
					<u-input v-model="examine" type="textarea" :border="true" border-color="#F7F7F7" :clearable="false" :height="80"/>
				</view>
			</view>
		</u-modal>
		
		<u-modal ref="uModal" v-model="editMoreShow" title="填写驳回原因" :show-cancel-button="true" confirm-text="提交" confirm-color="#fcc600" content="content" :async-close="true"  @confirm="optionEditAllClick">
			<view class="u-p-40">
				<view class="">
					<u-input v-model="examine" type="textarea" :border="true" border-color="#F7F7F7" :clearable="false" :height="80"/>
				</view>
			</view>
		</u-modal>
		
		<u-action-sheet :list="sheetList" :safe-area-inset-bottom="true" v-model="sheetShow"  @click="sheetClick"></u-action-sheet>

		<view >
			<view @click="optionCheckAllClick" class="back checkAll backTop_show u-flex u-flex-col u-row-center u-col-center" >
				<text style="color: #FFFFFF;font-size: small;">全选</text>
			</view>
			<view @click="optionCancelAllClick" class="back cancelAll backTop_show u-flex u-flex-col u-row-center u-col-center" >
				<text style="color: #FFFFFF;font-size: small;">取消</text>
			</view>
			<view @click="optionDelAllClick" class="back delete backTop_show u-flex u-flex-col u-row-center u-col-center" >
				<text style="color: #FFFFFF;font-size: small;">删除</text>
			</view>
			<view @click="optionEditAllClick(3)" class="back down backTop_show u-flex u-flex-col u-row-center u-col-center" v-if="tagCurrent==0">
				<text style="color: #FFFFFF;font-size: small;">下架</text>
			</view>
			<view @click="optionEditAllClick(1)" class="back up backTop_show u-flex u-flex-col u-row-center u-col-center" v-if="tagCurrent==0">
				<text style="color: #FFFFFF;font-size: small;">上架</text>
			</view>
			<view @click="optionEditAllClick(1)" class="back down backTop_show u-flex u-flex-col u-row-center u-col-center" v-if="tagCurrent==1">
				<text style="color: #FFFFFF;font-size: small;">通过</text>
			</view>
			<view @click="optionEditAllClick(2)" class="back up backTop_show u-flex u-flex-col u-row-center u-col-center" v-if="tagCurrent==1">
				<text style="color: #FFFFFF;font-size: small;">驳回</text>
			</view>
		</view>
	</view>
</template>

<script>
	import models from '@/components/model/model.vue'
	export default {
		data() {
			return {
				tagCurrent: 0,
				tagList: [{
					name: '全部'
				}, {
					name: '待审核'
				}, {
					name: '已驳回'
				}],
				navbarTop: 0,
				coverList: [],
				sheetList: [{
					text: '删除' 
				}],
				sheetShow: false,
				// 无数据
				noData: false,
				// 分页
				pageIndex: 0,
				loadStatus: 'loadmore',
				// 审核弹窗
				examine: '',
				coverId: '',
				userId: '',
				coverStatus: '',
				editShow: false,
				editMoreShow: false,
				isSearch: false,
				optionShow: true,
				searchKeyWord: '',
				editIdList: [],
			}
		},
		components: {
			models
		},
		onLoad({userId}) {
			var that = this
			if(userId) that.userId = userId
			that.getCoverList(that.tagCurrent, 1)
		},
		async onShow() {
			var that = this
			if(uni.getStorageSync("update_flag")){
				that.getCoverList(that.orderStatus, 1)
				uni.removeStorageSync('update_flag')
			}
		},
		methods: {
			cateClick(e){
				var that = this
				if(e == that.tagCurrent) return
				that.tagCurrent = e
				that.getCoverList(e, 1)
			},
			async searchClick(e) {
				var that = this
				console.log(e)
				
				if(that.isSearch){
					uni.showToast({
						icon: 'none',
						title: '太快啦，歇一会再试试',
						mask: true,
						duration: 1000
					})
					return
				}
				that.isSearch = true
				await that.getCoverList(that.tagCurrent, 1)
				that.isSearch = false
			},
			async getCoverList(status, on){
				var that = this
				var newList = that.coverList
				// 第一次进入触发
				if(on == 1){
					that.coverList = []
					newList = []
					that.pageIndex = 0
				}
				
				that.pageIndex = that.pageIndex + 1
				that.noData = false
				that.loadStatus = 'loading'
				
				var filter = {}
				if(status == 1) filter = {'status': 0}
				else if(status == 2) filter = {'status': 2}
				if(that.userId) filter.user_id = that.userId
				let list = await uniCloud.callFunction({
					name: 'search_list',
					data: {
						dbName: that.vuex_isShenHe?"wx_cover_shenhe":"wx_cover",
						filter: filter,
						order: {
							name: 'time',
							type: 'desc'
						},
						searchMore: that.searchKeyWord.trim()?{'name': that.searchKeyWord.trim(),'tags': that.searchKeyWord.trim(),'category_name': that.searchKeyWord.trim()}:'',
						searchMoreType: 'or',
						pageIndex: that.pageIndex,
						pageSize: 20
					},
				})
				
				if(list.result.hasMore) that.loadStatus = 'loadmore'
				else that.loadStatus = 'nomore'
				
				newList = newList.concat(list.result.data)
				that.coverList = newList
				
				if(that.coverList.length == 0) that.noData = true
				else that.noData = false
			},
			detailCheckedClick(index){
				console.log("点击", index)	
				var that = this
				const newCoverList = []
				var listData = {}
				for (var i = 0; i < that.coverList.length; i++) {
					listData = that.coverList[i]
					if(index == i){
						if(listData.checked){
							listData.checked = false
						}else{
							listData.checked = true
						}
					}
					newCoverList.push(listData)
				}
				console.log(newCoverList)
				that.coverList = newCoverList
				
			},
			optionCheckAllClick(){
				var that = this
				const newCoverList = []
				var listData = {}
				for (var i = 0; i < that.coverList.length; i++) {
					listData = that.coverList[i]
					listData.checked = true
					newCoverList.push(listData)
				}
				console.log(newCoverList)
				that.coverList = newCoverList
			},
			optionCancelAllClick(){
				var that = this
				const newCoverList = []
				var listData = {}
				for (var i = 0; i < that.coverList.length; i++) {
					listData = that.coverList[i]
					listData.checked = false
					newCoverList.push(listData)
				}
				console.log(newCoverList)
				that.coverList = newCoverList
			},
			optionDelAllClick(id){
				var that = this
				const deleteIdList = []
				var listData = {}
				for (var i = 0; i < that.coverList.length; i++) {
					listData = that.coverList[i]
					if(listData.checked)deleteIdList.push(listData._id)
				}
				
				uni.showModal({
				    title: '删除提示',
				    content: '确定删除当前选中作品吗？',
					confirmText: '删除',
					confirmColor: '#fcc600',
				    success: async function (res) {
				        if (res.confirm) {
				            uni.showLoading({
				            	mask: true,
				            	title: '删除中...'
				            })
				            let query = await uniCloud.callFunction({
				            	name: 'search_del',
				            	data: {
				            		dbName: that.vuex_isShenHe?"wx_cover_shenhe":"wx_cover",
				            		deleteIdList: deleteIdList
				            	},
				            })
				            if(query.result.success){
				            	that.getCoverList(that.tagCurrent, 1)
				            }
				            uni.showToast({
				            	icon: 'none',
				            	title: query.result.msg,
				            	mask: true,
				            	duration: 1000
				            })
				        }
				    }
				});
			},
			optionEditAllClick(status){
				var that = this
				var listData = {}
				var checkStatus = status==2?0:status==3?1:-1
				for (var i = 0; i < that.coverList.length; i++) {
					listData = that.coverList[i]
					if(listData.checked && status==1 && (listData.status==0||listData.status==3)){
						that.editIdList.push(listData._id)
					}else if(listData.checked&&listData.status==checkStatus){
						that.editIdList.push(listData._id)
					}
				}
				console.log('editIdList', that.editIdList)
				if(!that.editIdList.length){
					that.$refs.uModal.clearLoading();
					that.$u.toast("请选择有效投稿");
					return
				}
				if(that.editIdList && status){
					that.coverStatus = status
					if(status === 1 || status === 3){
						that.examineMoreClick()
					}else{
						that.editMoreShow = true
					}
				}else{
					if(!that.examine){
						that.$refs.uModal.clearLoading();
						that.$u.toast("请填写拒绝原因");
						return
					}else{
						var examine = that.examine
						that.examine = ''
						that.editMoreShow = false
						that.examineMoreClick(examine)
					}
				}
			},
			examineMoreClick(examine){
				var that = this
				var msg = "确定审核通过全部吗？"
				if(that.coverStatus === 2) msg = "确定驳回全部吗？"
				if(that.coverStatus === 3) msg = "确定下架全部吗？"
				uni.showModal({
					title: '审核提示',
					content: msg,
					confirmColor: '#fcc600',
					success: async function (res) {
						if (res.confirm) {
							uni.showLoading({
								mask: true,
								title: '正在拼命加载中...'
							})
							let query = await uniCloud.callFunction({
								name: 'search_edit',
								data: {
									dbName: that.vuex_isShenHe?"wx_cover_shenhe":"wx_cover",
									editList: that.editIdList,
									upData: {
										status: that.coverStatus,
										examine: examine
									}
								},
							})
							if(query.result.success){
								that.getCoverList(that.tagCurrent, 1)
								that.editIdList = []
								uni.showToast({
									icon: 'none',
									title: '全部修改成功',
									mask: true,
									duration: 1000
								})
								if(examine){
									var temp = await uniCloud.callFunction({
										name: 'template_send',
										data: {
											coverIds: that.editIdList
										}
									})
									if(!temp.result.success){
										uni.showToast({
											icon: 'none',
											title: temp.result.msg,
											mask: true,
											duration: 5000
										})
									}
								}
								
							}else{
								uni.showToast({
									icon: 'none',
									title: query.result.msg,
									mask: true,
									duration: 1000
								})
							}
						}
					}
				})
			},
			delClick(id){
				var that = this
				uni.showModal({
				    title: '删除提示',
				    content: '确定删除当前作品吗？',
					confirmText: '删除',
					confirmColor: '#fcc600',
				    success: async function (res) {
				        if (res.confirm) {
				            uni.showLoading({
				            	mask: true,
				            	title: '删除中...'
				            })
				            let query = await uniCloud.callFunction({
				            	name: 'search_del',
				            	data: {
				            		dbName: that.vuex_isShenHe?"wx_cover_shenhe":"wx_cover",
				            		filter: {
				            			'_id': id
				            		}
				            	},
				            })
				            if(query.result.success){
				            	that.getCoverList(that.tagCurrent, 1)
				            }
				            uni.showToast({
				            	icon: 'none',
				            	title: query.result.msg,
				            	mask: true,
				            	duration: 1000
				            })
				        }
				    }
				});
			},
			editChange(id, status){
				var that = this
				if(id && status){
					that.coverId = id
					that.coverStatus = status
					if(status === 1 || status === 3){
						that.examineClick()
					}else{
						that.editShow = true
					}
				}else{
					if(!that.examine){
						that.$refs.uModal.clearLoading();
						that.$u.toast("请填写拒绝原因");
						return
					}else{
						var examine = that.examine
						that.examine = ''
						that.editShow = false
						that.examineClick(examine)
					}
				}
			},
			examineClick(examine){
				var that = this
				var msg = "确定审核通过吗？"
				if(that.coverStatus === 2) msg = "确定驳回吗？"
				if(that.coverStatus === 3) msg = "确定下架吗？"
				uni.showModal({
					title: '审核提示',
					content: msg,
					confirmColor: '#fcc600',
					success: async function (res) {
						if (res.confirm) {
							uni.showLoading({
								mask: true,
								title: '正在拼命加载中...'
							})
							let query = await uniCloud.callFunction({
								name: 'search_edit',
								data: {
									dbName: that.vuex_isShenHe?"wx_cover_shenhe":"wx_cover",
									filter: {
										'_id': that.coverId
									},
									upData: {
										status: that.coverStatus,
										examine: examine
									}
								},
							})
							if(query.result.success){
								that.getCoverList(that.tagCurrent, 1)
								uni.showToast({
									icon: 'none',
									title: '审核成功',
									mask: true,
									duration: 1000
								})
								var temp = await uniCloud.callFunction({
									name: 'template_send',
									data: {
										coverId: that.coverId
									}
								})
								if(!temp.result.success){
									uni.showToast({
										icon: 'none',
										title: temp.result.msg,
										mask: true,
										duration: 5000
									})
								}
							}else{
								uni.showToast({
									icon: 'none',
									title: query.result.msg,
									mask: true,
									duration: 1000
								})
							}
						}
					}
				})
			},
			async niceClick(id, nice){
				var that = this
				uni.showLoading({
					mask: true,
					title: '正在拼命加载中...'
				})
				let query = await uniCloud.callFunction({
					name: 'search_edit',
					data: {
						dbName: that.vuex_isShenHe?"wx_cover_shenhe":"wx_cover",
						filter: {
							'_id': id
						},
						upData: {
							cover_nice: nice
						}
					},
				})
				if(query.result.success){
					that.getCoverList(that.tagCurrent, 1)
				}
				uni.showToast({
					icon: 'none',
					title: query.result.msg,
					mask: true,
					duration: 1000
				})
			},
			detailClick(id){
				uni.navigateTo({
					url: '/pages/detail/detail?id='+id+'&index=0'
				})
			},
			editClick(id){
				uni.navigateTo({
					url: '/pages/write/edit?id='+id
				})
			},
			stockClick(id){
				uni.navigateTo({
					url: '/pages/write/stock?id='+id
				})
			}
		},
		onReachBottom(){
			let that = this;
			if(that.loadStatus == 'nomore') return
			that.getCoverList(that.tagCurrent)
		},
	}
</script>

<style lang="scss">
	.menu{
		position: fixed;
		left: 0;
		width: calc(100% - 60rpx);
		z-index: 99;
		background-color: #FFFFFF;
	}
	.tags{
		font-size: 12px;
		border: 1rpx solid #B8B8B8;
		color: #909399;
		border-radius: 8rpx;
		line-height: 46rpx;
		padding: 0 20rpx;
	}
	
	.tag-active{
		background-image: linear-gradient(100deg, #fcfc44 , #f8c93c);
		border: none;
		color: #3a1800;
		// box-shadow: 0px 0px 10px #fff8ab;
		animation: tiaobig 0.8s ease-in-out alternate infinite;
		animation-iteration-count:1;
	}
	
	.no_active_{
		background-image: linear-gradient(100deg, #fc9999 , #fe7777);
		border: none;
		color: #3a1800;
		// box-shadow: 0px 4px 10px #fcb6b6;
		animation: tiaobig 0.8s ease-in-out alternate infinite;
		animation-iteration-count:1;
	}
	@keyframes tiaobig {
		0% {
			transform: scale(0.98);
		}
		25% {
			transform: scale(1.08);
		}
		50% {
			transform: scale(0.94);
		}
		75% {
			transform: scale(1.06);
		}
		100% {
			transform: scale(1);
		}
	}
	
	.tab{
		position: relative;
		height: 250rpx;
		margin-right: 15rpx;
		margin-bottom: 15rpx;
		image{
			border-radius: 16rpx;
		}
	}
	.btns{
		width: 475rpx;
		height: 250rpx;
		.title{
			font-weight: 550;
		}
	}
	.border-bottom{
		border-bottom: 1rpx solid #F3F4F6;
		position: relative;
	}
	.bohui{
		color: #ff4741;
	}
	
	.back {
		position: fixed;
		right: -80rpx;
		width: 80rpx;
		height: 80rpx;
		border-radius: 50rpx;
		padding: 8rpx;
		box-shadow: 0 0px 16px rgba(0, 0, 0, 0.2);
		transition-property: right;
		transition-duration: 0.6s;
	
		image {
			display: block
		}
	
		.text {
			font-size: 12px
		}
	}
	
	.checkAll {
		bottom: 420rpx;
		background-color: #21222385;
	
		.text {
			color: #FFFFFF
		}
	}
	.cancelAll {
		bottom: 330rpx;
		background-color: #21222385;
		.text {
			color: #FFFFFF
		}
	}
	.delete {
		bottom: 240rpx;
		background-color: #21222385;
	
		.text {
			color: #FFFFFF
		}
	}
	.down {
		bottom: 150rpx;
		background-color: #21222385;
	
		.text {
			color: #FFFFFF
		}
	}
	.up {
		bottom: 60rpx;
		background-color: #21222385;
	
		.text {
			color: #FFFFFF
		}
	}
	.backTop_show {
		right: 20rpx !important
	}
	
</style>