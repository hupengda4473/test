<template>
	<view v-if="!vuex_isShenHe">
		<u-navbar
		:is-back="true" 
		title="我的投稿" 
		title-width="325" 
		title-color="#333333" 
		title-size="28" 
		:border-bottom="false"
		></u-navbar>
		<view class="">
			<view class="u-flex u-row-left u-flex-wrap u-p-l-30 u-p-t-20">
				<view class="tab u-skeleton-fillet" @longpress="moreClick(item._id, true)" @click="detail(item._id, item.status)" v-for="(item, index) in coverList" :key="index">
					<image :src="item.status!=1?'/static/shenhe.jpg':vuex_compressPicture?item.image+'?x-oss-process=image/resize,w_200/quality,q_60':item.image" style="width: 220rpx;height: 400rpx;" mode="aspectFill"></image>
					<view class="array">{{item.images.length}}</view>
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
		
		<view class="add" @click="editClick()">
			<image src="/static/icon/add.png"></image>
		</view>
		
		<view class="" v-if="!noData">
			<u-loadmore :status="loadStatus" :font-size="24" :margin-top="30" :margin-bottom="30" color="#B8B8B8"/>
		</view>
		<view class="safe-area-inset-bottom">
			<view class="" style="height: 1px;"></view>
		</view>
		
		<u-action-sheet :list="sheetList" :safe-area-inset-bottom="true" v-model="sheetShow"  @click="sheetClick"></u-action-sheet>
		<models v-if="loginShow"
		title="为了更好的玩机体验，快去授权登录吧"
		btnText="授权登录" 
		@getUserInfo="getUserInfo" 
		@close="loginClose"></models>
		
		
		<models v-if="modelShow"
		:authorize="false" 
		title="将永久删除当前作品，确定继续删除吗？"
		btnText="立即删除" 
		closeText="再想想" 
		@close="modelShow = false" 
		@save="delClick"></models>
	</view>
</template>

<script>
	import models from '@/components/model/model.vue'
	export default {
		data() {
			return {
				orderStatus: 0,
				navbarTop: 0,
				coverList: [],
				sheetList: [{
					text: '删除' 
				}],
				sheetShow: false,
				loginShow: false,
				
				coverId: '',
				modelShow: false,
				// 无数据
				noData: false,
				// 分页
				pageIndex: 0,
				loadStatus: 'loadmore',
			}
		},
		components: {
			models
		},
		async onLoad() {
			var that = this
			that.pageIndex = 0
			that.coverList = []
			if(!that.vuex_user){
				that.loginShow = true
			}else{
				await that.getCoverList()
			}			
		},
		async onShow() {
			var that = this
			var write_flag = uni.getStorageSync('write_flag');
			if(write_flag){
				that.pageIndex = 0
				that.coverList = []
				await that.getCoverList()
				uni.removeStorageSync('write_flag');
			}
			
		},
		methods: {
			async getCoverList(){
				var that = this
				var newList = that.coverList
				that.pageIndex = that.pageIndex + 1
				that.noData = false
				that.loadStatus = 'loading'
				
				let list = await uniCloud.callFunction({
					name: 'search_list',
					data: {
						dbName: that.vuex_isShenHe?"wx_cover_shenhe":"wx_cover",
						order: {
							name: 'time',
							type: 'desc'
						},
						filter: {
							user_id: that.vuex_user._id
						},
						pageIndex: that.pageIndex,
						pageSize: 12
					},
				})
				
				if(list.result.hasMore) that.loadStatus = 'loadmore'
				else that.loadStatus = 'nomore'
				
				newList = newList.concat(list.result.data)
				that.coverList = newList
				
				if(that.coverList.length == 0) that.noData = true
				else that.noData = false
			},
			moreClick(id, status){
				this.coverId = id
				this.sheetShow = true
			},
			sheetClick(index){
				var text = this.sheetList[index].text
				if(text == '删除'){
					this.modelShow = true
				}else if(text == '下架'){
					console.log('下架')
				}
			},
			async loginClose(){
				var that = this
				that.loginShow = false
				uni.navigateBack({
					delta: 1
				})
			},
			async delClick(){
				var that = this
				that.modelShow = false
				uni.showLoading({
					mask: true,
					title: '删除中...'
				})
				let query = await uniCloud.callFunction({
					name: 'search_del',
					data: {
						dbName: that.vuex_isShenHe?"wx_cover_shenhe":"wx_cover",
						filter: {
							'_id': that.coverId
						},
						dbToName: 'wx_cdkey',
						toFilter: {
							'cover_id': that.coverId
						}
					},
				})
				if(query.result.success){
					that.pageIndex = 0
					that.coverList = []
					that.getCoverList()
				}
				uni.showToast({
					icon: 'none',
					title: query.result.msg,
					mask: true,
					duration: 1000
				})
			},
			editClick(id){
				uni.navigateTo({
					url: '/pages/write/edit'
				})
			},
			detail(id, status){
				if(status!=1)return;
				uni.navigateTo({
					url: '/pages/detail/detail?id='+id+'&index=0'
				})
			},
			async getUser() {
				let that = this
				let detail = await uniCloud.callFunction({
					name: 'search_map',
					data: {
						dbName: "wx_user",
						id: that.vuex_user._id
					},
				})
				that.$u.vuex('vuex_user', detail.result)
			},
			// 登录
			getUserInfo() {
				var that = this
				// #ifdef MP-WEIXIN
				uni.getUserProfile({
					desc: '个人登录，记录数据', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
					success(res) {
						console.log(res)
						that.name = res.userInfo.nickName; //昵称
						that.avatar = res.userInfo.avatarUrl; //头像
						that.wxlogin();
					},
					fail() {
						console.log("获取用户信息失败");
					}
				});
				// #endif
				// #ifdef MP-QQ
				uni.getUserInfo({
					// 获取信息成功
					success(res) {
						console.log(res)
						that.name = res.userInfo.nickName; //昵称
						that.avatar = res.userInfo.avatarUrl; //头像
						that.wxlogin();
					},
					fail() {
						console.log("获取用户信息失败");
					}
				});
				// #endif
			
			},
			//已经授权，自动登录
			async wxlogin() {
				let that = this;
				uni.showLoading({
					title: '登录中...'
				});
				uni.login({
					provider: 'weixin',
					success: function(loginRes) {
						let code = loginRes.code;
						that.wxloginres(code);
					},
				});
			
			},
			//登录后提交服务器获取进一步信息
			async wxloginres(wxcode) {
				let that = this;
			
				var userId = uni.getStorageSync('userId')
			
				var mptype
				// #ifdef MP-WEIXIN
				mptype = 'wx'
				// #endif
				// #ifdef MP-QQ
				mptype = 'qq'
				// #endif
			
				let authorize = await uniCloud.callFunction({
					name: 'user_authorize',
					data: {
						name: that.name,
						avatar: that.avatar,
						mptype: mptype,
						code: wxcode,
						userId: userId,
					},
				})
				if (authorize.result.success) {
					that.$u.vuex('vuex_user', authorize.result.data)
					that.getUser()
					await that.getCoverList()
					uni.showToast({
						icon: 'none',
						mask: true,
						title: '登录成功',
						duration: 1500
					})
					uni.removeStorageSync('userId')
				} else {
					uni.showToast({
						icon: 'none',
						mask: true,
						title: authorize.result.msg,
						duration: 1500
					})
				}
				that.loginShow = false
			},
			getLoginShow() {
				let that = this
				that.loginShow = true
			}
		},
		onReachBottom(){
			let that = this;
			if(that.loadStatus == 'nomore') return
			that.getCoverList()
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
		font-size: 14px;
		background-color: #F5F6F8;
		color: #909399;
		border-radius: 40rpx;
		line-height: 60rpx;
		padding: 0 40rpx;
	}
	
	.tag-active{
		background-image: linear-gradient(to right, #fcfc44 , #f8c93c);
		color: #333333;
		box-shadow: 0px 0px 10px #fff8ab;
		animation: tiaobig 0.8s ease-in-out alternate infinite;
		animation-iteration-count:1;
	}
	
	.tags_{
		font-size: 12px;
		color: #909399;
		border: 1rpx solid #B8B8B8;
		border-radius: 8rpx;
		line-height: 46rpx;
		padding: 0 20rpx;
	}
	
	.tag-active_{
		background-image: linear-gradient(to right, #fcfc44 , #f8c93c);
		color: #333333;
		box-shadow: 0px 0px 10px #fff8ab;
		border: none;
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
		margin-right: 17rpx;
		margin-bottom: 17rpx;
		image{
			border-radius: 16rpx;
		}
		.array{
			position: absolute;
			top: 15rpx;
			right: 15rpx;
			color: #FFFFFF;
			background-color: rgba(0, 0, 0, 0.4);
			padding: 4rpx 16rpx;
			border-radius: 8rpx;
			font-size: 12px;
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
	
	.add{
		animation: tiaobig 1.5s ease-in-out alternate infinite;
		background-color: #FFFFFF;
		position: fixed;
		bottom: 140rpx;
		right: 30rpx;
		border-radius: 120rpx;
		width: 90rpx;
		height: 90rpx;
		box-shadow: 0px 1px 8px #C8C8C8;
		image{
			width: 90rpx;
			height: 90rpx;
		}
	}
	@keyframes tiaobig {
		0% {
			transform: scale(0.92);
		}
		25% {
			transform: scale(1.08);
		}
		50% {
			transform: scale(0.96);
		}
		75% {
			transform: scale(1.06);
		}
		100% {
			transform: scale(0.94);
		}
	}
	.shzt{
		position: absolute;
		top: 110rpx;
		right: 20rpx;
		image{
			width: 120rpx;
			height: 120rpx;
		}
	}
	.bohui{
		color: #ff4741;
	}
</style>