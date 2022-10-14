<template>
	<view class="content">
		<view class="" v-show="!loadShow">
			<view class="vtop">
				<view v-if="!homeTop || scrollTop <= homeTop - (menuButtonInfo.top + 0 + 15)">
				<view class="title u-flex u-row-left u-p-l-40" :style="{marginTop: menuButtonInfo.top+'px'}">
					<text></text>
					<u-icon class="u-p-l-15 fenxiang" name="/static/icon/share.png" size="50"></u-icon>
					<button open-type="share"
						style="position: absolute;top: 20rpx;left: 20rpx;width: 50rpx;height: 50rpx;opacity: 0;"></button>
					<view class="search u-flex u-row-left" @click="search">
						<u-icon name="/static/icon/search.png" size="36"></u-icon>
						<text class="u-p-l-15">搜索你想要的壁纸</text>
					</view>
				</view>
				</view>
				<view class="div1"></view>
			</view>
			<view class="" :style="{marginTop: 'calc('+menuButtonInfo.top+'px + 5% + 45rpx + 30rpx)'}"></view>
			<view class="tags u-p-l-30 u-p-t-30 u-p-r-30">
				<view class="u-font-18 lei">热门标签</view>
				<view class="u-flex u-row-left u-flex-wrap u-p-t-30">
					<view class="tag" @click="listClick('tags','',item.name)" v-for="(item, index) in zodiacList"
						:key="index">{{item.name}}</view>
				</view>
			</view>
			<view class="u-p-l-30 u-p-t-40 u-p-r-30" v-if="vuex_bannerUnitId">
				<view class="u-font-18 lei">广告推荐</view>
				<view class="u-p-t-30">
				<ad :unit-id="vuex_bannerUnitId"></ad>
				</view>
			</view>
			<view class="category u-p-l-30 u-p-t-40 u-p-r-30">
				<view class="u-font-18 lei">壁纸分类</view>
				<view class="u-flex u-row-left u-flex-wrap u-p-t-30">
					<view class="cate" @click="listClick('category',index,item._id)" v-if="item.image"
						v-for="(item, index) in categoryList" :key="index">
						<image :src="item.image" mode="aspectFill"></image>
						<view class="texts">{{item.name}}</view>
					</view>
				</view>
			</view>
			<view class="" style="height: 180rpx;"></view>
		</view>
		<view class="loading_page" v-show="loadShow">
			<span class="loader-61"> </span>
		</view>
		<view @click="search" class="back backSearch u-flex u-flex-col u-row-center u-col-center"
			:class="backShow?'backTop_show':'backTop_hide'">
			<image src="/static/search.png" style="width: 30rpx;height: 30rpx;"></image>
		</view>
		<models v-if="loginShow" title="为了更好的玩机体验，快去授权登录吧" btnText="授权登录" @getUserInfo="getUserInfo"
			@close="loginShow = false"></models>
		<foo-bar @toIndex="toIndex" :home="1"></foo-bar>

	</view>
</template>

<script>
	let menuButtonInfo = {};
	// 如果是小程序，获取右上角胶囊的尺寸信息，避免导航栏右侧内容与胶囊重叠(支付宝小程序非本API，尚未兼容)
	// #ifdef MP-WEIXIN || MP-BAIDU || MP-TOUTIAO || MP-QQ
	menuButtonInfo = uni.getMenuButtonBoundingClientRect();
	// #endif

	import fooBar from '@/components/fooBar/fooBar.vue'
	import models from '@/components/model/model.vue'
	export default {
		components: {
			fooBar,
			models
		},
		data() {
			return {
				menuButtonInfo: menuButtonInfo,
				loadShow: true,
				loginShow: false,
				// 分类页数据
				zodiacList: [],
				categoryList: []
			}
		},
		async onLoad() {
			uni.hideTabBar()
			let that = this
			await that.getZodiacList()
			await that.getCateList()
			that.loadShow = false
		},

		methods: {
			async toIndex(index) {
				let that = this
				that.index = index
				if (index == 0) {
					uni.switchTab({
						url: '/pages/index/index'
					})
				} else if (index == 1) {
					uni.switchTab({
						url: '/pages/center/center'
					})
				} else if (index == 2) {
					uni.switchTab({
						url: '/pages/list/list'
					})
				} else if (index == 3) {
					uni.switchTab({
						url: '/pages/user/user'
					})
				} else if (index == 4) {
					if(!that.vuex_user){
						that.loginShow = true
						return
					}
					that.goToWrite()
				}


			},
			// 搜索
			async search() {
				uni.navigateTo({
					url: '/pages/search/search'
				})
			},
			// 分类
			async getZodiacList() {
				let that = this
				let list = await uniCloud.callFunction({
					name: 'search_list',
					data: {
						dbName: "wx_tags",
						order: {
							"name": 'time',
							"type": "asc"
						},
						pageIndex: 1,
						pageSize: 10
					},
				})
				that.zodiacList = list.result.data
			},
			async getCateList() {
				let that = this
				let list = await uniCloud.callFunction({
					name: 'search_list',
					data: {
						dbName: that.vuex_isShenHe?"wx_category_shenhe":"wx_category",
						pageIndex: 1,
						pageSize: 20,
						order: {
							name: 'sort',
							type: 'desc'
						}
					}
				})
				that.categoryList = list.result.data
			},
			listClick(type, pid, id) {
				uni.navigateTo({
					url: '/pages/searchlist/searchlist?type=' + type + '&pid=' + pid + '&id=' + id
				})
			},
			goToWrite(){
				uni.navigateTo({
					url: '/pages/write/write'
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
					that.goToWrite()
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
			},
			onShareAppMessage(res) {
				return {
					title: '精选手机壁纸、动漫二次元壁纸、明星创意潮图、抖音网红壁纸~',
					path: '/pages/center/center?userId=' + this.vuex_user._id
				}
			},
			onShareTimeline(res) {
				return {
					title: '精选手机壁纸、动漫二次元壁纸、明星创意潮图、抖音网红壁纸~',
					path: '/pages/center/center'
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
.vtop {
position: fixed;
top: 0px;
left: 0;
width: 100%;
z-index: 999999;
height: 13%;
background: #ffdf00;

.title {
position: relative;
color: #303030;
font-size: 20px;
line-height: 80rpx
}

.fenxiang {
margin-left: -20rpx;
margin-top: -10px
}

.search {
width: 55%;
background: #fff;
height: 60rpx;
margin: 20rpx 20rpx 20rpx 20rpx;
padding-left: 20rpx;
border-radius: 50px;
margin-top: 1px;

text {
	color: #a6a7a8;
	font-size: 14px
}
}

.div1 {
height: 35rpx;
width: 100%;
background: #ffffff;
border-radius: 50px 50px 0px 0px;
position: absolute;
bottom: -3px
}
}


.tags {
.tag {
font-size: 14px;
background-color: #F5F6F8;
color: #909399;
border-radius: 10rpx;
line-height: 60rpx;
padding: 0 27rpx;
width: auto;
text-align: center;
margin-right: 10rpx;
margin-bottom: 12rpx
}
.tag:nth-child(1){background-color:#d9f2fb;color:#1aa9fb;}
.tag:nth-child(2){background-color:#d9fcda;color:#3ab14a;}
.tag:nth-child(3){background-color:#fff3d0;color:#f67c23;}
.tag:nth-child(4){background-color:#f8cbff;color:#a123db;}
.tag:nth-child(5){background-color:#bbf1f2;color:#04839d;}
.tag:nth-child(6){background-color:#ffdede;color:#e84f4f;}
.tag:nth-child(7){background-color:#d9fcda;color:#3ab14a;}
.tag:nth-child(8){background-color:#d9f2fb;color:#1aa9fb;}
.tag:nth-child(9){background-color:#ffdede;color:#e84f4f;}
.tag:nth-child(10){background-color:#f8cbff;color:#a123db;}
.tag:nth-child(11){background-color:#fff3d0;color:#f67c23;}
.tag:nth-child(12){background-color:#bbf1f2;color:#04839d;}
.tag:nth-child(13){background-color:#bbf1f2;color:#3ab14a;}
.tag:nth-child(14){background-color:#ffdede;color:#e84f4f;}
.tag:nth-child(15){background-color:#d9fcda;color:#3ab14a;}
}
.lei{
	position: relative;
	padding-left: 15px;
	font-size: 18px;
}
.lei:before {
	position: absolute;
	content: '';
	width: 5px;
	background: #ffdf00;
	top: 18%;
	left: 2px;
	bottom: 10%;
	border-radius: 5px;
	box-shadow: 1px 1px 3px -1px #ffdf00;
	height: 18px;
}
.category {
.cate:nth-child(odd) {
position: relative;
margin-right: 15rpx;
margin-left: 0rpx;
margin-bottom: 30rpx;

image {
	display: block;
	width: 330rpx;
	height: 160rpx;
	border-radius: 15rpx;
	opacity:0.8;
}

.texts {
    position: absolute;
    bottom: 30px;
    left: 100rpx;
    color: #FFFFFF;
    align-items: center;
    text-shadow: #000 3px 4px 5px;
    font-size: 16px;
}
}
.cate:nth-child(even) {
position: relative;
margin-right: 0rpx;
margin-left: 15rpx;
margin-bottom: 30rpx;

image {
	display: block;
	width: 330rpx;
	height: 160rpx;
	border-radius: 15rpx;
	opacity:0.8;
}

.texts {
    position: absolute;
    bottom: 30px;
    left: 100rpx;
    color: #FFFFFF;
    align-items: center;
    text-shadow: #000 3px 4px 5px;
    font-size: 16px;
}
}
}

.cate-active {
transform: scale(0.95);
transition: all 0.2s
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
