<template>
	<view>
		<view class="" v-show="!loadShow">
			<u-navbar :is-back="true" title="积分任务" title-width="325" title-color="#333333" title-size="28"
				:border-bottom="false"></u-navbar>
			<view class="top">
				<view class="icon u-flex u-row-center u-col-center u-p-t-20">
					<image src="../../static/icon/jinbi.png"></image>
				</view>
				<view class="kapian u-flex-col u-row-center u-col-center u-p-t-30">
					<view class="price">{{ nowUserIntegral }}</view>
					<view class="shuom u-font-12 u-tips-color u-p-t-10">当前可用积分</view>
				</view>
			</view>
			<view class="u-p-l-40 u-p-r-40">
				<view class="u-font-18 u-m-t-80 u-m-b-30 title">积分任务</view>
				<view class="safe-area-inset-bottom">

					<view class="tab u-flex u-row-between u-col-center border-bottom u-p-t-30 u-p-b-30">
						<view class="u-flex u-row-left u-col-center">
							<view class="icon u-flex u-row-center u-col-center">
								<u-icon name="/static/icon/user2.png" size="46"></u-icon>
							</view>
							<view class="u-p-l-20 u-p-t-10">
								<view class="">每日签到</view>
								<view class="u-font-12 u-light-color">+{{ signIntegral }}积分/天</view>
							</view>
						</view>
						<view class="btn" hover-class="hover-class" hover-stay-time="50" @click="signClick"
							v-if="!vuex_isSign">去签到</view>
						<view class="btn-disable" hover-class="hover-class" hover-stay-time="50" v-if="vuex_isSign">已签到
						</view>
					</view>
					<view class="tab u-flex u-row-between u-col-center border-bottom u-p-t-30 u-p-b-30">
						<view class="u-flex u-row-left u-col-center">
							<view class="icon u-flex u-row-center u-col-center">
								<u-icon name="/static/icon/user1.png" size="46"></u-icon>
							</view>
							<view class="u-p-l-20 u-p-t-10">
								<view class="">邀请好友</view>
								<view class="u-font-12 u-light-color">+{{ inviteIntegral }}积分/位</view>
							</view>
						</view>
						<view class="btn" hover-class="hover-class" hover-stay-time="50">
							去邀请
							<button open-type="share"
								style="position: absolute;top: 0;left: 0;width: 100%;height: 100%;opacity: 0;"></button>
						</view>
					</view>
					<view class="tab u-flex u-row-between u-col-center border-bottom u-p-t-30 u-p-b-30">
						<view class="u-flex u-row-left u-col-center">
							<view class="icon u-flex u-row-center u-col-center">
								<u-icon name="/static/icon/video.png" size="46"></u-icon>
							</view>
							<view class="u-p-l-20 u-p-t-10">
								<view class="">看广告</view>
								<view class="u-font-12 u-light-color">+{{ adIntegral }}积分/次</view>
							</view>
						</view>
						<view class="btn" hover-class="hover-class" hover-stay-time="50" @click="adClick">去观看</view>
					</view>
					<view class="u-font-12 u-light-color u-text-center u-p-t-40">更多任务敬请期待~</view>
				</view>
			</view>
		</view>
		<models v-if="signShow" :authorize="false" :title="signTitle" btnText="知道了" closeText=" "
			@save="signShow = false"></models>

		<view class="loading_page" v-show="loadShow">
			<span class="loader-61"> </span>
		</view>
	</view>
</template>

<script>
	let videoAd = null;
	import models from '@/components/model/model.vue'
	export default {
		components: {
			models
		},
		data() {
			return {
				nowUserIntegral: 0,
				signIntegral: 0,
				inviteIntegral: 0,
				adIntegral: 0,
				chargeShow: false,
				cashShow: false,
				loadShow: true,
				signShow: false,
				signTitle: '',
				//adUnitId: '0'
			};
		},
		async onLoad() {
			await this.getConfig();
			this.loadShow = false;
			this.adLoad()
		},
		async onShow() {
			this.getUser();
		},
		methods: {
			async getUser() {
				let that = this;
				let detail = await uniCloud.callFunction({
					name: 'search_map',
					data: {
						dbName: 'wx_user',
						id: that.vuex_user._id
					}
				});
				that.nowUserIntegral = detail.result.integral;
			},
			async getConfig() {
				let that = this;
				let config = {};
				config = await uniCloud.callFunction({
					name: 'config_search',
					data: {
						keys: ['signIntegral', 'inviteIntegral', 'adIntegral', 'chargeShow']
					}
				});
				if (config.result.success) {
					that.signIntegral = parseInt(config.result.data[0])
					that.inviteIntegral = parseInt(config.result.data[1])
					that.adIntegral = parseInt(config.result.data[2])
					that.chargeShow = config.result.data[3]
				}
			},
			async signClick() {
				var that = this
				if (!that.vuex_user) {
					that.loginShow = true
					return
				}
				if (that.vuex_isSign) return

				uni.showLoading({
					mask: true,
					title: '签到中...'
				})
				let sign = await uniCloud.callFunction({
					name: 'sign_add',
					data: {
						"userId": that.vuex_user._id
					},
				})
				uni.hideLoading()
				if (sign.result.success) {
					that.getUser()
					that.signTitle =
						"<p style='font-weight: 550;font-size: 16px;'>签到成功</p><p style='padding-top: 10px;'>获得<span class='num'>" +
						sign.result.integral + "</span>积分</p>"
					that.$u.vuex('vuex_isSign', true)
				} else {
					uni.showToast({
						icon: 'none',
						mask: true,
						title: sign.result.msg,
						duration: 1500
					})
				}
			},
			async userIntegral() {
				var that = this
				uni.showLoading({
					mask: true,
					title: '正在拼命加载中...'
				})
				let data = await uniCloud.callFunction({
					name: 'user_integral',
					data: {
						userId: that.vuex_user._id
					},
				})
				uni.hideLoading()
				if (data.result.success) {
					that.getUser()
					that.signTitle =
						"<p style='font-weight: 550;font-size: 16px;'>观看成功</p><p style='padding-top: 10px;'>获得<span class='num'>" +
						data.result.integral + "</span>积分</p>"
					that.signShow = true
				}
			},
			adClick() {
				var that = this
				if (!that.vuex_user) {
					that.loginShow = true
					return
				}
				if (videoAd) {
					videoAd.show().catch(err => {
						// 失败重试
						// console.log("广告拉去失败")
						videoAd.load().then(() => videoAd.show())
					})
				}
			},
			adLoad() {
				var that = this
				if (wx.createRewardedVideoAd) {
					// 加载激励视频广告
					// #ifdef MP-QQ
					videoAd = wx.createRewardedVideoAd({
						adUnitId: that.vuex_qqRewardedVideoUnitId
					});
					// #endif
					// #ifdef MP-WEIXIN
					videoAd = wx.createRewardedVideoAd({
						adUnitId: that.vuex_wxRewardedVideoUnitId
					});
					// #endif
					//捕捉错误
					videoAd.onError(err => {
						// 进行适当的提示
						console.log('videoAd onError', err);
					});
					// 监听关闭
					videoAd.onClose(status => {
						if ((status && status.isEnded) || status === undefined) {
							// 正常播放结束，下发奖励
							if (that.vuex_user) {
								that.userIntegral()
							}
						} else {
							// 播放中途退出，进行提示
							console.log('中途退出')
						}
					});
				}
			},
			charge() {
				uni.navigateTo({
					url: '/pages/integral/charge'
				});
			},
			cash() {
				uni.navigateTo({
					url: '/pages/integral/cash'
				});
			}
		},
		onShareAppMessage(res) {
			return {
				title: '我等风也等你，近听水无声~',
				path: '/pages/index/index?userId=' + this.vuex_user._id
			};
		}
	};
</script>

<style lang="scss">
	.top {
		image {
			width: 120rpx;
			height: 120rpx;
		}

		.kapian {
			height: 240rpx;
			margin: -60rpx 40rpx 0 40rpx;
			background: linear-gradient(to bottom right, #6cb3ff, #866bf1);
			color: #ffffff;
			border-radius: 36rpx;
			box-shadow: 0px 10px 20px #a2beff;

			.price {
				font-size: 32px;
				font-weight: 700;
			}

			.shuom {
				color: #e5e5e5;
			}
		}
	}

	.title {
		border-left: 6rpx solid #648af1;
		padding-left: 15rpx;
		line-height: 34rpx;
		color: #808080;
	}

	.tab {
		.icon {
			width: 80rpx;
			height: 80rpx;
			border-radius: 80rpx;
		}

		.btn {
			position: relative;
			background-image: linear-gradient(to right, #fcfc44, #f8c93c);
			padding: 7px 15px;
			border-radius: 20px;
			font-size: 12px;
		}

		.btn-disable {
			position: relative;
			background-image: linear-gradient(to right, #b5b5b5, #b6b6b6);
			padding: 7px 15px;
			border-radius: 20px;
			font-size: 12px;
		}

		.hover-class {
			transform: scale(0.95);
			transition: all 0.2s;
		}
	}

	.tab:nth-child(1) .icon {
		background-image: linear-gradient(to right, #f5d553, #f0b347);
	}

	.tab:nth-child(2) .icon {
		background-image: linear-gradient(to right, #84d787, #5fbb92);
	}

	.tab:nth-child(3) .icon {
		background-image: linear-gradient(to right, #6cb3ff, #5476f1);
	}

	.tab:nth-child(4) .icon {
		background-image: linear-gradient(to right, #fa7a09, #ee6000);
	}

	@-webkit-keyframes animloader61 {
		0% {
			height: 48px;
		}

		100% {
			height: 4.8px;
		}
	}

	@keyframes animloader61 {
		0% {
			height: 48px;
		}

		100% {
			height: 4.8px;
		}
	}

	@-webkit-keyframes animloader61m {
		0% {
			height: 40px;
			transform: translateY(0);
		}

		100% {
			height: 10px;
			transform: translateY(30px);
		}
	}

	@keyframes animloader61m {
		0% {
			height: 40px;
			transform: translateY(0);
		}

		100% {
			height: 10px;
			transform: translateY(30px);
		}
	}
.loader-61 {
  width: 8px;
  height: 40px;
  border-radius: 4px;
  display: inline-block;
  position: relative;
  background: currentColor;
  color: #ffdf00;
  -webkit-animation: animloader61 0.3s 0.3s linear infinite alternate;
          animation: animloader61 0.3s 0.3s linear infinite alternate;
}
.loader-61::after, .loader-61::before {
  content: "";
  width: 8px;
  height: 40px;
  border-radius: 4px;
  background: currentColor;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 20px;
  -webkit-animation: animloader61 0.3s 0.45s linear infinite alternate;
          animation: animloader61 0.3s 0.45s linear infinite alternate;
}
.loader-61::before {
  left: -20px;
  -webkit-animation-delay: 0s;
          animation-delay: 0s;
}
</style>
