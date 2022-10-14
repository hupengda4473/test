<template>
	<view v-if="!vuex_isShenHe&&!loadShow">
		<u-navbar :is-back="true" title="投稿" title-width="325" title-color="#333333" title-size="28" :border-bottom="false"></u-navbar>
		<view class="u-p-40">
			<u-form ref="uForm" :model="cover">
				<view class="u-p-b-20">
					<u-upload
						ref="uUpload"
						action=""
						max-count="100"
						:file-list="coverId!='-1'?imgList:''" 
						:auto-upload="false"
						:uploadText="cover.mode == 0 ? '上传壁纸' : '上传图片'"
						:width="cover.mode == 0 ? 203 : 203"
						:height="cover.mode == 0 ? 325 : 203"
						:maxSize="20 * 1024 * 1024"
						:show-progress="false"
						:size-type="['original']"
						:source-type="['album']"
						:multiple="true"
						del-icon="close"
						del-bg-color="#ff7c7c"
						del-color="#FFFFFF"
						:limitType="['png', 'jpg', 'jpeg']"
					></u-upload>
				</view>
				<view class="" style="border-bottom: 1rpx solid #F4F4F4;border-top: 1rpx solid #F4F4F4;">
					<u-form-item label="主题" :border-bottom="false"><u-input v-model="cover.name" :clearable="false" placeholder="设置主题更容易被搜索到" /></u-form-item>
				</view>
				<view class="" style="border-bottom: 1rpx solid #F4F4F4;">
					<u-form-item label="类型" :border-bottom="false">
						<u-radio-group v-model="cover.mode" @change="radioGroupChange">
							<u-radio active-color="#fdc621" size="50" :name="0">壁纸</u-radio>
						</u-radio-group>
					</u-form-item>
				</view>
				<view class="" style="border-bottom: 1rpx solid #F4F4F4;">
					<u-form-item label="分类" :border-bottom="false" right-icon="arrow-right" :right-icon-style="iconStyle">
						<u-input v-model="cover.category_name" :clearable="false" :disabled="true" placeholder="选择分类" @click="cateClick" />
					</u-form-item>
				</view>
				<view class="" style="border-bottom: 1rpx solid #F4F4F4;">
					<u-form-item label="标签" :border-bottom="false" right-icon="arrow-right" :right-icon-style="iconStyle">
						<u-input v-model="cover.tags" :clearable="false" :disabled="true" placeholder="选择标签（可选）" @click="tagsClick" />
					</u-form-item>
				</view>
			
				<view class="" style="border-bottom: 1rpx solid #F4F4F4;">
					<u-form-item label="心情" :border-bottom="false">
						<u-input v-model="cover.feeling" :clearable="true" placeholder="写下你的感想" type="textarea" :trim="true" :auto-height="true"/>
					</u-form-item>
				</view>
			</u-form>
			<view class="u-p-t-40"><view class="btn" hover-class="hover-class" hover-stay-time="50" @click="submit">{{editType?'发 布':'提 交'}}</view></view>
	
		</view>
		<view class="loading_page" v-show="loadShow">
			<view class="sp sp-wave"></view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			iconStyle: {
				fontSize: '12px',
				color: '#D8D8D8'
			},
			cover: {
				mode: 0,
				category_id: '',
				category_name: '',
				tags: ''
			},
			writeExam: true,
			loadShow: true,
			templateId: '',
			imgList: [],
			newCover: {},
			coverId: '',
			editType: true,
			useAliyunOss: false,
			aliurl:'',
			policy:'',	
			accessKeyId:'',	
			signature:'',	
		};
	},
	async onLoad({id}) {
		var that = this
		if(id){
			that.getCover(id)
			that.coverId = id
			that.editType = false
		}else{
			await that.getConfig();
			if(that.vuex_user){
				that.getUser()
			}
		}
		that.loadShow = false
		
	},
	onShow() {
		var that = this;
		var id = uni.getStorageSync('categoryId');
		var name = uni.getStorageSync('categoryName');
		var tags = uni.getStorageSync('tags');
		if (id && name) {
			that.cover.category_id = id;
			that.cover.category_name = name;
			uni.removeStorageSync('categoryId');
			uni.removeStorageSync('categoryName');
		}
		if (tags) {
			that.cover.tags = tags.join(',');
			uni.removeStorageSync('tags');
		}
	},
	methods: {
		async getCover(id){
			var that = this
			let coverDetail= await uniCloud.callFunction({
				name: 'search_map',
				data: {
					dbName: that.vuex_isShenHe?"wx_cover_shenhe":"wx_cover",
					id: id
				}
			})
			for (var i = 0; i < coverDetail.result.images.length; i++) {
				that.imgList.push({url: coverDetail.result.images[i]})
			}
			delete coverDetail.result._id
			that.cover = coverDetail.result
			if(!that.cover.mode)that.cover.mode=0
			that.newCover = JSON.stringify(coverDetail.result)
		},
		async getConfig() {
			let that = this;
			let config = await uniCloud.callFunction({
				name: 'config_search',
				data: {
					keys: ['writeExam', 'templateId','useAliyunOss','aliurl','policy','accessKeyId','signature']
				}
			});
			if (config.result.success) {
				that.writeExam = config.result.data[0];
				that.templateId = config.result.data[1];
				that.useAliyunOss = config.result.data[2];
				that.aliurl = config.result.data[3];
				that.policy = config.result.data[4];
				that.accessKeyId = config.result.data[5];
				that.signature = config.result.data[6];
			}
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
		equar(a, b) {
		    // 判断数组的长度
		    if (a.length !== b.length) {
		        return false
		    } else {
		        // 循环遍历数组的值进行比较
		        for (let i = 0; i < a.length; i++) {
		            if (a[i] !== b[i]) {
		                return false
		            }
		        }
		        return true;
		    }
		},
		async submit() {
			var that = this;
			var imgs = that.$refs.uUpload.lists;
			if (imgs.length == 0) {
				that.$u.toast('请上传图片');
				return;
			}
			if (!that.cover.name) {
				that.$u.toast('请填写主题');
				return;
			}
			if (!that.cover.category_id || !that.cover.category_name) {
				that.$u.toast('请选择分类');
				return;
			}
			
			// #ifdef MP-WEIXIN
			if (that.writeExam && that.templateId) {
				var res = await uni.requestSubscribeMessage({
					tmplIds: [that.templateId]
				});
			}
			// #endif
			var newImages = []
			imgs.forEach(item=>{
				newImages.push(item.url)
			})
			if(!that.editType&& that.equar(newImages, that.cover.images) && JSON.stringify(that.cover)===that.newCover){
				that.$u.toast("请修改内容后再提交");
				return;
			}
			if(!that.editType){
				that.newCover = JSON.parse(that.newCover)
				that.newCover.images = newImages
			}
			
			uni.showLoading({
				mask: true,
				title: '正在拼命加载中...'
			});
			if(that.editType){
				
				var imgPaths = [];
				// var thumbPaths = []
				for (var i = 0; i < imgs.length; i++) {
					uni.showLoading({
						mask: true,
						title: '上传中'+imgs.length+'/'+(i+1)+'...'
					});
					
					var path = imgs[i].url;
					var extension = path.substring(path.lastIndexOf('.') + 1)
					var random = String(Math.random()*100000).split('.')[0]
					var now = new Date()
					var year = now.getFullYear()
					var month = (now.getMonth() + 1) < 10?'0'+(now.getMonth() + 1):(now.getMonth() + 1)
					var day = now.getDate() < 10?'0'+now.getDate():now.getDate()
					var hours = now.getHours() < 10?'0'+now.getHours():now.getHours()
					var minutes = now.getMinutes() < 10?'0'+now.getMinutes():now.getMinutes()
					var seconds = now.getSeconds() < 10?'0'+now.getSeconds():now.getSeconds()
					
					var cloudPath = 'wall'+'/'+year+'/'+month+'/'+day+'/'+hours+minutes+seconds+'_'+random+'.'+extension
					if(that.useAliyunOss){
						var url = that.aliurl
						var image = url+'/'+cloudPath
						imgPaths.push(image)
						await uni.uploadFile({
							url: url, //上传的路径
							filePath: path,
							name: 'file',
							formData: {
								name: path,
								key: cloudPath,
								policy: that.policy,
								OSSAccessKeyId: that.accessKeyId,
								success_action_status: '200',
								signature: that.signature
							},
							success: async function(res) {
								console.log('上传成功')
							},
							fail: function({ errMsg }) {
								uni.showLoading({
									mask: true,
									title: '第'+(i+1)+'张上传失败...'
								});
							}
						});
					}else{
						await uniCloud.uploadFile({
						    filePath: path,
							cloudPath: cloudPath
						}).then(async res => {
							await uniCloud.getTempFileURL({
								fileList: [res.fileID]
							}).then(res => {
								if(res.fileList.length > 0){
									imgPaths.push(res.fileList[0].tempFileURL)
								}else{
									that.$u.toast("图片上传失败");
									return;
								}
							});
						})
					}
					
					
				
				}
				// uni.showLoading({
				// 	mask: true,
				// 	title: '正在拼命加载中...'
				// });
				
				that.cover.images = imgPaths;
				// that.cover.thumbs = thumbPaths
				that.cover.image = imgPaths[0];
				that.cover.coll = [];
				that.cover.zan = [];
				that.cover.view = 0;
				if (that.writeExam) that.cover.status = 0;
				else that.cover.status = 1;
				that.cover.user_id = that.vuex_user._id;
				
				
			}
			
			let query = await uniCloud.callFunction({
				name: 'search_edit',
				data: {
					dbName: that.vuex_isShenHe?"wx_cover_shenhe":"wx_cover",
					filter: {
						_id: that.editType?'-1':that.coverId
					},
					addData: that.cover,
					upData: that.newCover
				}
			});
			uni.hideLoading();
			if (query.result.success) {
				setTimeout(function() {
					uni.setStorageSync('write_flag', true)
					uni.navigateBack();
				}, 1000);
			}
			uni.showToast({
				icon: 'none',
				title: query.result.msg,
				mask: true,
				duration: 1000
			});

			
			
		},
		cateClick() {
			uni.navigateTo({
				url: '/pages/write/cate'
			});
		},
		tagsClick() {
			uni.navigateTo({
				url: '/pages/write/tags'
			});
		},
		radioGroupChange(name) {
			this.cover.mode = parseInt(name);
		}
	}
};
</script>

<style lang="scss">
.btn {
	font-size: 16px;
	background-image: linear-gradient(100deg, #fcfc44, #f8c93c);
	color: #333333;
	border-radius: 40rpx;
	line-height: 86rpx;
	text-align: center;
}
.hover-class {
	transform: scale(0.92);
	transition: all 0.2s;
}
.u-delete-icon {
	position: absolute;
	top: 20rpx;
	right: 20rpx;
	z-index: 10;
	background-color: rgba(255, 255, 255, 0.35);
	border-radius: 100rpx;
	width: 44rpx;
	height: 44rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}
</style>