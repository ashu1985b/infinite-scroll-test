import React, { useEffect, useReducer, useRef } from 'react';
import logo from './logo.svg';
import './App.css';
import { useLazyLoading, useInfiniteScroll } from "./customHooks"
import axios from "axios"
interface ImgData {
  images: any[];
  fetching?: boolean;
}
interface ImgDispatch {
  type: string;
  images?: any[];
  fetching?: boolean;
}
interface Pager {
  page: number;
}
interface PagerDispatch {
  type: string;
  page?: number;
}
function App() {
  const dataReducer = (state: ImgData, action: ImgDispatch) => {
    switch (action.type) {
      case 'ADD_IMAGES':
        return { ...state, images: state.images.concat(action.images) }
      case 'FETCHING_IMAGES':
        return { ...state, fetching: action.fetching }
      default:
        return state
    }
  }
  const pageReducer = (state: Pager, action: PagerDispatch) => {
    switch (action.type) {
      case 'NEXT_PAGE':
        return { ...state, page: state.page + 1 }
      default:
        return state;
    }
  }
  const [ pager, pagerDispatch ] = useReducer(pageReducer, { page: 1 })
  const [data, dataDispatch] = useReducer(dataReducer,{ images:[], fetching: true})
  useEffect(() => {
    dataDispatch({ type: 'FETCHING_IMAGES', fetching: true })
    axios.get(`https://picsum.photos/v2/list?page=${pager.page}&limit=10`)
      .then(res => {
        const images: any[] = res.data
        dataDispatch({ type: 'ADD_IMAGES', images })
        dataDispatch({ type: 'FETCHING_IMAGES', fetching: false })
      })
      .catch(e => {
        // handle error
        dataDispatch({ type: 'FETCHING_IMAGES', fetching: false })
        return e
      })
  }, [ dataDispatch, pager.page ])
  useLazyLoading('.img-lazy', data.images)
  let bottomBoundaryRef = useRef(null)
  useInfiniteScroll(bottomBoundaryRef, pagerDispatch, data.images)

  return (
    <div className="app">
      <header className="app__header">
        <img src={logo} className="app__header__logo" alt="logo" />
        <div className="app__header__title">Infinite Scroll</div>
      </header>
      <div className="container container--main">
        <div className="card-container">
          {
            data.images.map((image, index) => {
              const { author, download_url, id } = image
              return (
                <div key={index}>
                  <div className="card">
                    <div className="card__body">
                      <img
                        alt={author}
                        className="card__img img-lazy"
                        data-src={download_url}
                        src={'https://picsum.photos/id/180/300/200?grayscale&blur=2'}
                      />
                    </div>
                    <div className="card__footer">
                      <span className="card__tag">id: {id}</span>
                      <br/>
                      By: {author}
                    </div>
                  </div>
                </div>
              )
            })
          }
        </div>
        {
          data.images.length &&
          <div ref={bottomBoundaryRef}>
            {
              data.fetching && (
                <div className="loader">
                  <img src={logo} className="loader__icon" alt="loader" />
                </div>
              )
            }
          </div>
        }
      </div>
    </div>
  );
}

export default App;
