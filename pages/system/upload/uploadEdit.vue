<template>
	<view v-if="vuex_user.system == 1">
		<view class="u-p-40">
			<u-form ref="uForm" :model="upload">
				<view class="" style="border-bottom: 1rpx solid #F4F4F4;border-top: 1rpx solid #F4F4F4;">
					<u-form-item label="类型" :border-bottom="false">
						<u-radio-group v-model="uploadType" @change="radioGroupChange">
							<u-radio active-color="#fdc621" size="50" name="aliyun">阿里云OSS</u-radio>
						</u-radio-group>
					</u-form-item>
				</view>
				<view class="" style="border-bottom: 1rpx solid #F4F4F4;border-top: 1rpx solid #F4F4F4;" v-if="uploadType==='aliyun'">
					<u-form-item label="名称" :border-bottom="false">
						<u-input v-model="upload.name" type="textarea" :height="40" :clearable="false" placeholder="阿里云配置名称"/>
					</u-form-item>
					<u-form-item label="policy" :border-bottom="false">
						<u-input v-model="upload.policy" type="textarea" :height="40" :clearable="false" placeholder="阿里云policy"/>
					</u-form-item>
					<u-form-item label="OSSAK" :border-bottom="false">
						<u-input v-model="upload.OSSAccessKeyId" type="textarea" :height="40" :clearable="false" placeholder="阿里云OSSAccessKeyId"/>
					</u-form-item>
					<u-form-item label="signature" :border-bottom="false">
						<u-input v-model="upload.signature" type="textarea" :height="40" :clearable="false" placeholder="阿里云signature"/>
					</u-form-item>
				</view>
			</u-form>
			<view class="u-p-t-40">
				<view class="btn" hover-class="hover-class" hover-stay-time="50" @click="submit">发 布</view>
			</view>
		</view>
		<t-color-picker ref="colorPicker" :color="color" @confirm="confirm"></t-color-picker>
	</view>
</template>

<script>
	import tColorPicker from '@/components/t-color-picker/t-color-picker.vue'
	export default {
		components: {
		            tColorPicker
		        },
		data() {
			return {
				iconStyle: {
					fontSize: '12px',
					color: '#D8D8D8'
				},
				customStyle: {
					backgroundImage: 'linear-gradient(to right, #FCEF59 , #F8D246)',
					color: "#333333"
				},
				uploadId: '',
				upload: {},
				newUpload: {},
				uploadType: 'aliyun'			}
		},
		async onLoad({id}) {
			var that = this;
			that.uploadId = id
			if(id!='-1') that.getConfig(id)
		},
		methods: {
			async getConfig(id){
				var that = this;
				let detail = await uniCloud.callFunction({
					name: 'search_map',
					data: {
						dbName: "wx_upload_config",
						id: id
					}
				})
				delete detail.result._id
				that.uploadType = detail.result.uploadType?detail.result.uploadType: ''
				console.log(that.uploadType)
				that.upload = detail.result
				that.newUpload = JSON.stringify(detail.result)
			},
			async submit() {
				var that = this
				var imgs = that.$refs.uUpload.lists;
				if(!that.upload.policy){
					that.$u.toast("请填写阿里云policy");
					return;
				}
				if(!that.upload.OSSAccessKeyId){
					that.$u.toast("请填写阿里云OSSAccessKeyId");
					return;
				}
				if(!that.upload.signature){
					that.$u.toast("请填写阿里云signature");
					return;
				}
			
				if(that.uploadType){
					that.upload.uploadType = that.uploadType
				}
				
				if(that.uploadId != '-1' && JSON.stringify(that.upload)===that.newUpload){
					that.$u.toast("请修改内容后再提交");
					return;
				}
				
				uni.showLoading({
					mask: true,
					title: '正在拼命加载中...'
				})
				
				let query = await uniCloud.callFunction({
					name: 'search_edit',
					data: {
						dbName: "wx_upload_config",
						filter: {
							'_id': that.uploadId
						},
						addData: that.upload,
						upData: that.upload
					},
				})
				if(query.result.success){
					setTimeout(function(){
						uni.navigateBack()
					},1000)
					uni.setStorageSync("update_cps_flag", 1)
				}
				uni.showToast({
					icon: 'none',
					title: query.result.msg,
					mask: true,
					duration: 1000
				})
			},
			chooseImage() {
				var rectWidth = 350, rectHeight = 146, destWidth = 700, destHeight = 294
				this.$u.route({
					url: '/uview-ui/components/u-avatar-cropper/u-avatar-cropper',
					params: {
						rectWidth: rectWidth,
						rectHeight: rectHeight,
						destWidth: destWidth,
						destHeight: destHeight,
						fileType: 'jpg',
					}
				})
			},
			delImage(type){
				this.imgPath = ''
			},
			radioGroupChange(name) {
				console.log('name', name)
				this.uploadType = name;
		
			}
		}
	}
</script>

<style lang="scss">
	.upload {
		text-align: center;
	}
	.upload-text {
		font-size: 40rpx;
		font-weight: 800;
	}
	.btn{
		font-size: 16px;
		background-image: linear-gradient(100deg, #FCEF59 , #f8d319);
		color: #333333;
		border-radius: 40rpx;
		line-height: 86rpx;
		text-align: center;
	}
	.hover-class{
		transform:scale(0.92);
		transition: all 0.2s;
	}
	
	
	.img{
		position: relative;
	}
	.img-bg{
		width: 400rpx;
		height: 167rpx;
		background: #f4f5f6;
		border-radius: 10rpx;
		margin: 10rpx;
	}
	.u-delete-icon{
		position: absolute;
		top: 20rpx;
		right: 20rpx;
		z-index: 10;
		background-color: rgba(255,255,255,0.35);
		border-radius: 100rpx;
		width: 44rpx;
		height: 44rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>