import { ArrowPath, ChevronLeft, ChevronRight } from '@/components/HeroIcons'
import Link from 'next/link'
import { compressImage } from '@/lib/notion/mapImage'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useRef, useState, useEffect } from 'react'
import { usePlogGlobal } from '..'

/**
 * 弹出框组件
 */
export default function Modal(props) {
  const { showModal, setShowModal, modalContent, setModalContent } =
    usePlogGlobal()
  const { siteInfo, posts } = props
  const cancelButtonRef = useRef(null)

  // 添加状态来存储上一张图片的内容
  const [prevModalContent, setPrevModalContent] = useState(null)

  // 添加 loading 状态
  const [loading, setLoading] = useState(true)

  // 添加图片尺寸状态
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  })

  // 控制图片和文字显示状态，用于控制它们的淡入淡出效果
  const [showContent, setShowContent] = useState(false)

  // 控制纯色层显示的状态
  const [showColorLayer, setShowColorLayer] = useState(true) // 初次加载时默认显示

  // 图片加载完成状态，避免重复加载
  const [imageLoaded, setImageLoaded] = useState(false)

  // 计算容器的宽高，并添加过渡动画
  const [containerStyle, setContainerStyle] = useState({
    width: 'auto',
    height: 'auto',
  })

  // 读取环境变量，决定图片是否为不可点击的 <div>
  const disableImageLink =
    process.env.NEXT_PUBLIC_ENABLE_IMAGE_LINK === 'false'

  // 关闭弹窗
  function handleClose() {
    setShowModal(false)
    setLoading(true)
    setShowContent(false)
    setShowColorLayer(true)
    setImageLoaded(false)
  }

  // 切换图片时更新 prevModalContent
  function changeImage(newContent) {
    setShowContent(false) // 先隐藏图片和文字
    setShowColorLayer(true) // 显示纯色层
    setPrevModalContent(modalContent) // 保存当前内容作为上一张图片的内容
    setModalContent(newContent) // 切换到新的图片
    setLoading(true) // 开始加载新图片
    setImageLoaded(false) // 重置图片加载状态
  }

  // 上一张图片
  function prev() {
    const index = posts?.findIndex((post) => post.slug === modalContent.slug)
    if (index === 0) {
      changeImage(posts[posts.length - 1])
    } else {
      changeImage(posts[index - 1])
    }
  }

  // 下一张图片
  const next = () => {
    const index = posts.findIndex((post) => post.slug === modalContent.slug)
    if (index === posts.length - 1) {
      changeImage(posts[0])
    } else {
      changeImage(posts[index + 1])
    }
  }

  // 获取当前和上一张图片的大图
  const bigImage = compressImage(
    modalContent?.pageCover || siteInfo?.pageCover,
    1200,
    85,
    'webp'
  )

  // 当 modalContent 或 showModal 变化时，预加载新图片并获取尺寸
  useEffect(() => {
    let isCurrent = true // 防止竞态条件

    if (showModal && modalContent) {
      setLoading(true)
      setShowContent(false)
      setShowColorLayer(true)
      setImageLoaded(false)

      if (bigImage) {
        const img = new Image()
        img.src = bigImage
        img.onload = () => {
          if (isCurrent) {
            setImageDimensions({
              width: img.naturalWidth,
              height: img.naturalHeight,
            })
            setLoading(false)
            setImageLoaded(true) // 标记图片加载完成

            // 当图片加载完成后，先调整容器大小，再显示图片和文字
            setShowColorLayer(true) // 显示纯色层
            setTimeout(() => {
              setShowColorLayer(false) // 隐藏纯色层
              setShowContent(true) // 显示图片和文字
            }, 300) // 保证容器调整好尺寸后才显示内容
          }
        }

        img.onerror = () => {
          if (isCurrent) {
            // 处理图片加载错误
            console.error('图片加载失败:', bigImage)
            setLoading(false)
            setShowColorLayer(false)
            setShowContent(true)
          }
        }
      }
    }

    return () => {
      isCurrent = false // 清理标志
    }
  }, [showModal, modalContent, bigImage])

  // 当 imageDimensions 变化时，计算容器的样式
  useEffect(() => {
    if (imageDimensions.width && imageDimensions.height) {
      const maxContainerWidth = window.innerWidth * 0.9 // 最大宽度为窗口宽度的90%
      const maxContainerHeight = window.innerHeight * 0.9 // 最大高度为窗口高度的90%

      let containerWidth = imageDimensions.width
      let containerHeight = imageDimensions.height

      // 按比例缩放，确保容器不超过最大尺寸
      const widthRatio = containerWidth / maxContainerWidth
      const heightRatio = containerHeight / maxContainerHeight
      if (widthRatio > 1 || heightRatio > 1) {
        const maxRatio = Math.max(widthRatio, heightRatio)
        containerWidth = containerWidth / maxRatio
        containerHeight = containerHeight / maxRatio
      }

      // 设置容器样式，添加过渡动画
      setContainerStyle({
        width: containerWidth + 'px',
        height: containerHeight + 'px',
        transition: 'width 0.5s, height 0.5s',
        overflow: 'hidden', // 确保图片不会溢出容器
      })
    } else {
      // 如果没有图片尺寸，则设置为默认尺寸
      setContainerStyle({
        width: 'auto',
        height: 'auto',
        transition: 'width 0.5s, height 0.5s',
        overflow: 'hidden', // 确保图片不会溢出容器
      })
    }
  }, [imageDimensions])

  // 渲染图片部分，依据 disableImageLink 判断是否将图片包裹在 <Link> 中
  const renderImage = () => {
    const imgElement = (
      <img
        src={bigImage}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          showContent ? 'opacity-100' : 'opacity-0'
        }`}
        alt={modalContent?.title || '图片'}
        onError={() => {
          setShowColorLayer(false)
          setShowContent(true)
        }}
      />
    )
    if (!disableImageLink && modalContent?.href) {
      return <Link href={modalContent.href}>{imgElement}</Link>
    } else {
      return <div>{imgElement}</div>
    }
  }

  return (
    <Transition.Root show={showModal} as={Fragment}>
      <Dialog
        as='div'
        className='relative z-20'
        initialFocus={cancelButtonRef}
        onClose={handleClose}
      >
        {/* 遮罩 */}
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            className='fixed inset-0 glassmorphism transition-opacity'
          />
        </Transition.Child>

        <div className='fixed inset-0 z-30 overflow-y-auto'>
          <div className='flex min-h-full justify-center p-4 text-center items-center'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 translate-y-4 scale-50'
              enterTo='opacity-100 translate-y-0 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 translate-y-0 scale-100'
              leaveTo='opacity-0 translate-y-4 scale-50'
            >
              <Dialog.Panel
                className='group relative transform overflow-hidden rounded-xl text-left shadow-xl transition-all'
                style={containerStyle}
              >
                {/* 加载中的动画效果 */}
                {loading && (
                  <div className='absolute right-0 bottom-0 m-4'>
                    <ArrowPath className='w-10 h-10 animate-spin text-gray-200' />
                  </div>
                )}

                {/* 纯色层部分 */}
                {showColorLayer && (
                  <div
                    className='absolute inset-0 bg-gray-800 z-10 transition-opacity duration-500'
                  ></div>
                )}

                {/* 图片部分 */}
                <div
                  className='relative w-full h-full flex items-center justify-center overflow-hidden'
                  style={{ backgroundColor: '#333' }} // 深灰色背景
                >
                  {renderImage()}
                </div>

                {/* 图片下方的文字和导航按钮 */}
                <>
                  <div
                    className={`absolute bottom-0 left-0 m-4 z-20 transition-opacity duration-1000 ${
                      showContent ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <div className='flex'>
                      <h2
                        className='text-xl md:text-2xl text-white px-2 py-1 rounded-lg'
                        style={{ textShadow: '1px 1px 2px black' }} // 添加黑色阴影
                      >
                        {modalContent?.title}
                      </h2>
                    </div>
                    <div
                      className='text-sm md:text-base overflow-hidden cursor-pointer text-white rounded-lg m-2'
                      style={{ textShadow: '1px 1px 2px black' }} // 添加黑色阴影
                    >
                      {modalContent?.summary}
                    </div>

                    {modalContent?.category && (
                      <div className='flex'>
                        <Link
                          href={`/category/${modalContent?.category}`}
                          className='text-xs rounded-lg mt-2 px-2 py-1 bg-black bg-opacity-20 text-white hover:bg-blue-700 hover:text-white duration-200'
                        >
                          {modalContent?.category}
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* 导航按钮 */}
                  <div
                    onClick={prev}
                    className='z-10 absolute left-2 top-1/2 transform -translate-y-1/2 opacity-50 hover:opacity-100 duration-200 transition-opacity cursor-pointer'
                  >
                    <ChevronLeft className='cursor-pointer w-12 h-16 hover:opacity-100 stroke-white stroke-1 scale-y-150' />
                  </div>
                  <div
                    onClick={next}
                    className='z-10 absolute right-2 top-1/2 transform -translate-y-1/2 opacity-50 hover:opacity-100 duration-200 transition-opacity cursor-pointer'
                  >
                    <ChevronRight className='cursor-pointer w-12 h-16 hover:opacity-100 stroke-white stroke-1 scale-y-150' />
                  </div>
                </>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}