import { useGlobal } from '@/lib/global'
import { useEffect, useState } from 'react'

export default function LoadingCover() {
  const { onLoading, setOnLoading } = useGlobal()
  const [isVisible, setIsVisible] = useState(false) // 初始状态设置为false，避免服务端渲染与客户端渲染不一致

  useEffect(() => {
    // 确保在客户端渲染时才设置可见性
    if (onLoading) {
      setIsVisible(true)
    } else {
      const timeout = setTimeout(() => setIsVisible(false), 1500) // 等待淡出动画结束
      return () => clearTimeout(timeout)
    }
  }, [onLoading])

  const handleClick = () => {
    setOnLoading(false) // 强行关闭 LoadingCover
  }

  if (typeof window === 'undefined') {
    return null // 避免在服务端渲染时渲染出这个组件
  }

  return isVisible ? (
    <div
      id='loading-cover'
      onClick={handleClick}
      className={`dark:text-white text-black bg-white dark:bg-black animate__animated animate__faster ${onLoading ? 'animate__fadeIn' : 'animate__fadeOut'
        } flex flex-col justify-center z-50 w-full h-screen fixed top-0 left-0`}>
      <div className='mx-auto'>
        <style jsx>{`
          /* Loading.css */
/* From Uiverse.io by Nawsome */ 
.typewriter {
    --blue: #5C86FF;
    --blue-dark: #275EFE;
    --key: #fff;
    --paper: #EEF0FD;
    --text: #D3D4EC;
    --tool: #FBC56C;
    --duration: 3s;
    position: relative;
    -webkit-animation: bounce05 var(--duration) linear infinite;
    animation: bounce05 var(--duration) linear infinite;
  }
  
  .typewriter .slide {
    width: 92px;
    height: 20px;
    border-radius: 3px;
    margin-left: 14px;
    transform: translateX(14px);
    background: linear-gradient(var(--blue), var(--blue-dark));
    -webkit-animation: slide05 var(--duration) ease infinite;
    animation: slide05 var(--duration) ease infinite;
  }
  
  .typewriter .slide:before, .typewriter .slide:after,
  .typewriter .slide i:before {
    content: "";
    position: absolute;
    background: var(--tool);
  }
  
  .typewriter .slide:before {
    width: 2px;
    height: 8px;
    top: 6px;
    left: 100%;
  }
  
  .typewriter .slide:after {
    left: 94px;
    top: 3px;
    height: 14px;
    width: 6px;
    border-radius: 3px;
  }
  
  .typewriter .slide i {
    display: block;
    position: absolute;
    right: 100%;
    width: 6px;
    height: 4px;
    top: 4px;
    background: var(--tool);
  }
  
  .typewriter .slide i:before {
    right: 100%;
    top: -2px;
    width: 4px;
    border-radius: 2px;
    height: 14px;
  }
  
  .typewriter .paper {
    position: absolute;
    left: 24px;
    top: -26px;
    width: 40px;
    height: 46px;
    border-radius: 5px;
    background: var(--paper);
    transform: translateY(46px);
    -webkit-animation: paper05 var(--duration) linear infinite;
    animation: paper05 var(--duration) linear infinite;
  }
  
  .typewriter .paper:before {
    content: "";
    position: absolute;
    left: 6px;
    right: 6px;
    top: 7px;
    border-radius: 2px;
    height: 4px;
    transform: scaleY(0.8);
    background: var(--text);
    box-shadow: 0 12px 0 var(--text), 0 24px 0 var(--text), 0 36px 0 var(--text);
  }
  
  .typewriter .keyboard {
    width: 120px;
    height: 56px;
    margin-top: -10px;
    z-index: 1;
    position: relative;
  }
  
  .typewriter .keyboard:before, .typewriter .keyboard:after {
    content: "";
    position: absolute;
  }
  
  .typewriter .keyboard:before {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 7px;
    background: linear-gradient(135deg, var(--blue), var(--blue-dark));
    transform: perspective(10px) rotateX(2deg);
    transform-origin: 50% 100%;
  }
  
  .typewriter .keyboard:after {
    left: 2px;
    top: 25px;
    width: 11px;
    height: 4px;
    border-radius: 2px;
    box-shadow: 15px 0 0 var(--key), 30px 0 0 var(--key), 45px 0 0 var(--key), 60px 0 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key), 22px 10px 0 var(--key), 37px 10px 0 var(--key), 52px 10px 0 var(--key), 60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 10px 0 var(--key);
    -webkit-animation: keyboard05 var(--duration) linear infinite;
    animation: keyboard05 var(--duration) linear infinite;
  }
  
  @keyframes bounce05 {
    85%, 92%, 100% {
      transform: translateY(0);
    }
  
    89% {
      transform: translateY(-4px);
    }
  
    95% {
      transform: translateY(2px);
    }
  }
  
  @keyframes slide05 {
    5% {
      transform: translateX(14px);
    }
  
    15%, 30% {
      transform: translateX(6px);
    }
  
    40%, 55% {
      transform: translateX(0);
    }
  
    65%, 70% {
      transform: translateX(-4px);
    }
  
    80%, 89% {
      transform: translateX(-12px);
    }
  
    100% {
      transform: translateX(14px);
    }
  }
  
  @keyframes paper05 {
    5% {
      transform: translateY(46px);
    }
  
    20%, 30% {
      transform: translateY(34px);
    }
  
    40%, 55% {
      transform: translateY(22px);
    }
  
    65%, 70% {
      transform: translateY(10px);
    }
  
    80%, 85% {
      transform: translateY(0);
    }
  
    92%, 100% {
      transform: translateY(46px);
    }
  }
  
  @keyframes keyboard05 {
    5%, 12%, 21%, 30%, 39%, 48%, 57%, 66%, 75%, 84% {
      box-shadow: 15px 0 0 var(--key), 30px 0 0 var(--key), 45px 0 0 var(--key), 60px 0 0 var(--key), 75px 0 0 var(--key), 90px 0 0 var(--key), 22px 10px 0 var(--key), 37px 10px 0 var(--key), 52px 10px 0 var(--key), 60px 10px 0 var(--key), 68px 10px 0 var(--key), 83px 10px 0 var(--key);
    }
  }
        `}</style>
        <div className="typewriter">
          <div className="slide"><i></i></div>
          <div className="paper"></div>
          <div className="keyboard"></div>
        </div>
      </div>
    </div>
  ) : null
}