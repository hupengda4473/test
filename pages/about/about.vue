<template>
	<view>
		<u-navbar
		:is-back="true" 
		title="关于我们" 
		title-width="325" 
		title-color="#333333" 
		title-size="28" 
		:border-bottom="false"
		></u-navbar>
		<view class="top u-flex-col u-col-center u-p-t-80">
			<img :src="appLogo"></img>
			<view class="name u-p-t-30 u-font-18">{{appName}}</view>
			<view class="u-tips-color u-font-14 u-p-t-15">- 精选手机壁纸分享平台 -</view>
			<view class="u-tips-color u-font-14 u-p-t-15">V1.2.0</view>
		</view>
		<view class="menu u-m-l-40 u-m-r-40 u-m-t-40 border-box">
			<view class="u-flex u-row-between u-p-30 border-bottom" hover-class="hover-class1" hover-stay-time="50" @click="agreementClick">
				<view class="u-p-l-20">用户协议</view>
				<view class="arror-right"></view>
			</view>
			<view class="u-flex u-row-between u-p-30 border-bottom" hover-class="hover-class1" hover-stay-time="50" @click="policyClick">
				<view class="u-p-l-20">隐私政策</view>
				<view class="arror-right"></view>
			</view>
			<view class="u-flex u-row-between u-p-30 border-bottom" hover-class="hover-class1" hover-stay-time="50" @click="gengxinClick">
				<view class="u-p-l-20">更新记录</view>
				<view class="arror-right"></view>
			</view>
			<view class="u-flex u-row-between u-p-30 border-bottom" hover-class="hover-class1" hover-stay-time="50" @click="gonggaoClick" v-if="ggShow">
				<view class="u-p-l-20">重要通知</view>
				<view class="arror-right"></view>
			</view>
		</view>
		<view class="menu u-m-l-40 u-m-r-40 u-m-t-40 border-box">
		<view v-if="vuex_customUnitId">
			<ad-custom :unit-id="vuex_customUnitId" @load="adLoad" @error="adError" @close="adClose"></ad-custom>
		</view>
		</view>
		<view class="bottom u-p-40 u-text-center u-font-12 u-tips-color">
			内容来源于网络，如涉及版权问题，请随时联系告知！
		</view>
	</view>
</template>
<script>
	export default {
		data() {
			return {
				appName: '壁纸',
				appLogo: '',
				// 重要公告显示
				ggShow: false,
			}
		},
		async onLoad({
			userId,
			detailId,
			index,

		}) {
			uni.hideTabBar()
			if (userId) uni.setStorageSync('userId', userId)
			if (detailId) uni.navigateTo({
				url: '/pages/detail/detail?id=' + detailId + '&index=' + index
			})
			let that = this
			await that.getConfig()
			await that.getIndex()
			if (that.vuex_indexUiType == 1) {
				that.getindexList()
				that.getindesList()
			}
			await that.getList(that.cateStatic, null, 1)
			// 获取分类位置
			that.$nextTick(function() {
				const query = uni.createSelectorQuery().in(that);
				query.select(".query").boundingClientRect(res => {
					if (res.bottom) {
						that.homeTop = (res.bottom + res.top) / 2
					}
				}).exec()
			})
			that.loadShow = false

		},
		methods: {
			agreementClick(){
				uni.navigateTo({
					url: '/pages/about/agreement'
				})
			},
			gengxinClick(){
				uni.navigateTo({
					url: '/pages/about/gengxin'
				})
			},
			gonggaoClick(){
				uni.navigateTo({
					url: '/pages/about/gonggao'
				})
			},
			adLoad() {
				this.adFlag = true
			},
			adError(err) {
				this.adFlag = false
			},
			adClose() {
				this.adFlag = false
			},
			async getConfig() {
				let that = this;
				let config = await uniCloud.callFunction({
					name: 'config_search',
					data: {
						keys: ['isShenHe', 'uiType', 'appName','ggShow','appLogo']
					}
				});
				if (config.result.success) {
					that.$u.vuex('vuex_isShenHe', config.result.data[0])
					that.UiType = config.result.data[1] != '' ? parseInt(config.result.data[1]) : 0
					that.$u.vuex('vuex_appName', config.result.data[2])
					that.appName = config.result.data[2]
					that.ggShow = config.result.data[3]
					that.appLogo = config.result.data[4]
				}
			},
			policyClick(){
				uni.navigateTo({
					url: '/pages/about/policy'
				})
			}
		},
		
	}
</script>

<style lang="scss">
	.bottom{
		position: fixed;
		bottom: 40rpx;
	}
	.name{
		font-weight: 550;
	}
	image{
		width: 180rpx;
		height: 180rpx;
		border-radius: 180rpx;
	}
	.border-box{
		box-shadow: 0 0px 24px rgba(231, 231, 231, 0.6);
		border-radius: 16rpx;
	}
	.menu{
		image{
			width: 38rpx;
			height: 38rpx;
		}
	}
	.border-bottom{
		border-bottom: 1rpx solid #F6F6F6;
		position: relative;
	}
	.hover-class1{
		background-color: #F8F8F8;
	}
	.arror-right{
		width: 15rpx;
		height: 15rpx;
		border-top: 3rpx solid #a9acb3;
		border-right: 3rpx solid #a9acb3;
		transform: rotate(45deg);
	}
	.dcont{
		color: #df0003;
	}
	.adtop{margin-top: 10px;}
	.u-text-center{
		padding: 0px;
            width:100%;
            height:20px;
            text-align:center;
            display: table-cell;
            vertical-align:middle}
</style>
