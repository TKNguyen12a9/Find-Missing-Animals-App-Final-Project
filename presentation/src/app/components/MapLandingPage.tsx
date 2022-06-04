import React, { useState } from 'react';
import Map from './Map';

export interface propsType {
  searchKeyword: string;
}

export default function MapLandingPage() {
  const [value, setValue] = useState('');
  const [Keyword, setKeyword] = useState('');
  const keywordChange = (e: {
    preventDefault: () => void;
    target: { value: string };
  }) => {
    e.preventDefault();
    setValue(e.target.value);
  };

  const submitKeyword = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setKeyword(value);
  };

  const valueChecker = () => {
    if (value === '') {
      alert('�˻�� �Է����ּ���.');
    }
  };

  return (
    <div className="landing-page">
      <div className="landing-page__inner">
        <div className="search-form-container">
          <form className="search-form" onSubmit={submitKeyword}>
            <label htmlFor="place" className="form__label">
              <input
                type="text"
                id="movie-title"
                className="form__input"
                name="place"
                onChange={keywordChange}
                placeholder="�˻�� �Է����ּ���. (ex: ����� �����)"
                required
              />
              <div className="btn-box">
                <input
                  className="btn form__submit"
                  type="submit"
                  value="�˻�"
                  onClick={valueChecker}
                />
              </div>
            </label>
          </form>
        </div>
        <Map searchKeyword={Keyword} />
      </div>
    </div>
  );
}
