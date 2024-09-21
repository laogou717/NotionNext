import { ArrowPath, ChevronLeft, ChevronRight } from '@/components/HeroIcons'
import LazyImage from '@/components/LazyImage'
import { compressImage } from '@/lib/notion/mapImage'
import { Dialog, Transition } from '@headlessui/react'
import Link from 'next/link'
import { Fragment, useRef, useState } from 'react'
import { usePlogGlobal } from '..'

/**
 * 弹出框
 */
export default function Modal(props) {
  const { showModal, setShowModal, modalContent, setModalContent } =
    usePlogGlobal()
  const { siteInfo, posts } = props
  const cancelButtonRef = useRef(null)

  // 添加状态来存储上一张图片的内容
  const [prevModalContent, setPrevModalContent] = useState(null)

  // 添加loading状态
  const [loading, setLoading] = useState(true)

  // 在图片加载完成时设置loading为false
  function handleImageLoad() {
    setLoading(false)
  }

  // 关闭弹窗
  function handleClose() {
    setShowModal(false)
    setLoading(true)
  }

  // 修改当前显示的遮罩内容
  function prev() {
    setLoading(true)
    const index = posts?.findIndex(post => post.slug === modalContent.slug)
    if (index === 0) {
      setModalContent(posts[posts.length - 1])
    } else {
      setModalContent(posts[index - 1])
    }
  }
  // 下一个
  const next = () => {
    setLoading(true)
    const index = posts.findIndex(post => post.slug === modalContent.slug)
    if (index === posts.length - 1) {
      setModalContent(posts[0])
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

    // 当弹窗打开且有内容时，开始加载图片
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
            setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight })
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
      })
    } else {
      // 如果没有图片尺寸，则设置为默认尺寸
      setContainerStyle({
        width: 'auto',
        height: 'auto',
        transition: 'width 0.5s, height 0.5s',
      })
    }
  }, [imageDimensions])

  return (
    <Transition.Root show={showModal} as={Fragment}>
      <Dialog
        as='div'
        className='relative z-20'
        initialFocus={cancelButtonRef}
        onClose={handleClose}>
        {/* 遮罩 */}
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'>
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
              enterFrom='opacity-0 translate-y-4 scale-50 w-0'
              enterTo={'opacity-100 translate-y-0 max-w-screen'}
              leave='ease-in duration-200'
              leaveFrom='opacity-100 translate-y-0 scale-100  max-w-screen'
              leaveTo='opacity-0 translate-y-4 scale-50 w-0'>
              <Dialog.Panel className='group relative transform overflow-hidden rounded-xl text-left shadow-xl transition-all '>
                {/* 添加onLoad事件处理函数 */}
                {/* 添加loading状态 */}
                {/* <div
                  className={`bg-hexo-black-gray w-32 h-32 flex justify-center items-center `}> */}
                <div
                  className={`absolute right-0 bottom-0 m-4 ${loading ? '' : 'hidden'}`}>
                  <ArrowPath
                    className={`w-10 h-10 animate-spin text-gray-200`}
                  />
                </div>

                {/* </div> */}

                <Link href={modalContent?.href}>
                  <LazyImage
                    onLoad={handleImageLoad}
                    placeholderSrc={thumbnail}
                    src={bigImage}
                    ref={imgRef}
                    className={`w-full select-none max-w-7xl max-h-[90vh] shadow-xl  animate__animated animate__fadeIn'`}
                  />
                </Link>

                <>
                  <div className='absolute bottom-0 left-0 m-4 z-20'>
                    <div className='flex'>
                      <h2
                        style={{ textShadow: '0.1em 0.1em 0.2em black' }}
                        className='text-2xl md:text-5xl text-white mb-4 px-2 py-1 rounded-lg'>
                        {modalContent?.title}
                      </h2>
                    </div>
                    <div
                      style={{ textShadow: '0.1em 0.1em 0.2em black' }}
                      className={
                        'line-clamp-3 md:line-clamp-none overflow-hidden cursor-pointer text-gray-50 rounded-lg m-2'
                      }>
                      {modalContent?.summary}
                    </div>

                    {modalContent?.category && (
                      <div className='flex'>
                        <Link
                          href={`/category/${modalContent?.category}`}
                          className='text-xs rounded-lg mt-3 px-2 py-1 bg-black bg-opacity-20 text-white hover:bg-blue-700 hover:text-white duration-200'>
                          {modalContent?.category}
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* 卡片的阴影遮罩，为了凸显图片上的文字 */}
                  <div className='h-1/2 w-full absolute left-0 bottom-0'>
                    <div className='h-full w-full absolute opacity-80 group-hover:opacity-100 transition-all duration-1000 bg-gradient-to-b from-transparent to-black'></div>
                  </div>

                  {/* <div className="z-10 absolute hover:opacity-50 opacity-0 duration-200 transition-opacity w-full top-0 left-0 px-4 h-full items-center flex justify-between"> */}

                  <div
                    onClick={prev}
                    className='z-10 absolute left-0 top-1/2 -mt-12 group-hover:opacity-50 opacity-0 duration-200 transition-opacity'>
                    <ChevronLeft className='cursor-pointer w-24 h-32 hover:opacity-100 stroke-white stroke-1 scale-y-150' />
                  </div>
                  <div
                    onClick={next}
                    className='z-10 absolute right-0 top-1/2 -mt-12 group-hover:opacity-50 opacity-0 duration-200 transition-opacity'>
                    <ChevronRight className='cursor-pointer w-24 h-32 hover:opacity-100 stroke-white stroke-1 scale-y-150' />
                  </div>
                  {/* </div> */}
                </>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
