import { useEffect, useCallback, useRef } from "react"

const  throttle = (fn: any, wait: number) => {
  var time = Date.now();
  return function() {
    if ((time + wait - Date.now()) < 0) {
      fn();
      time = Date.now();
    }
  }
}
// lazy load images with intersection observer
export const useLazyLoading = (imgSelector: string, items: any) => {
  const imgsRef: any = useRef(null)
  const imgObserver = useCallback((el) => {
    const initObs = new IntersectionObserver((entries) => {
      entries.forEach(ent => {
        if (ent.intersectionRatio > 0) {
          const img = ent.target as HTMLImageElement
          const imgSrc = img.dataset.src
          if (!imgSrc) {
            console.error('Image source is not defined')
          } else {
            img.src = imgSrc
          }
          initObs.unobserve(el)
        }
      })
    })
    initObs.observe(el)
  }, [])

  useEffect(() => {
    imgsRef.current = document.querySelectorAll(imgSelector)
    if (imgsRef.current) {
      imgsRef.current.forEach((img: HTMLImageElement) => imgObserver(img))
    }
  }, [imgObserver, imgsRef, imgSelector, items])
}

// infinite scrolling with intersection observer
export const useInfiniteScroll = (scrollRef: any, dispatch: any, data: any[] = []) => {
  const scrollObserver = useCallback(
    (el) => {
      const option = {
        root: null,
        rootMargin: '50px',
        threshold: 0
      }
      new IntersectionObserver((entries) => {
        entries.forEach(en => {
          if (en.intersectionRatio > 0) {
            dispatch({ type: 'NEXT_PAGE' })
          }
        })
      }, option).observe(el)
    },
    [dispatch]
  )
  const handleScroll = () => {
    if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight) return;
    dispatch({ type: 'NEXT_PAGE' })
  }
  useEffect(() => {
    if (scrollRef.current) {
      if (window.IntersectionObserver) {
        scrollObserver(scrollRef.current)
      } else {
        const throttleHandleScroll = throttle(handleScroll, 300)
        window.addEventListener('scroll', throttleHandleScroll)
        return () => window.removeEventListener('scroll', throttleHandleScroll)
      }
    }
  }, [scrollObserver, scrollRef, data.length])
}