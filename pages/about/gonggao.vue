<template>
	<view>
		<view class="u-p-40">

			<view class="cont">
				{{notice}}
			</view>
		</view>
	</view>
</template>
<script>
	export default {
		data() {
			return {
				notice: '重要公告',
				
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
			async getConfig() {
				let that = this;
				let config = await uniCloud.callFunction({
					name: 'config_search',
					data: {
						keys: ['isShenHe', 'uiType', 'notice']
					}
				});
				if (config.result.success) {
					that.$u.vuex('vuex_isShenHe', config.result.data[0])
					that.UiType = config.result.data[1] != '' ? parseInt(config.result.data[1]) : 0
					that.$u.vuex('vuex_notice', config.result.data[2])
					that.notice = config.result.data[2]
				}
			},
		}
	}
</script>

<style>
	.title {
		font-weight: 550;
		font-size: 32rpx;
		padding-bottom: 30rpx;
	}

	.cont {
		line-height: 50rpx;
		padding-bottom: 40rpx;
		color: #606266;
	}

	.dcont {
		line-height: 50rpx;
		padding-bottom: 40rpx;
		color: #df0003;
	}
</style>
