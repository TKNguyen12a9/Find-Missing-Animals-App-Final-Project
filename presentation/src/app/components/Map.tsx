import usePosts from 'app/hooks/usePosts';
import React, { useEffect } from 'react';
import { propsType } from './MapLandingPage';

interface placeType {
  place_name: string;
  road_address_name: string;
  address_name: string;
  phone: string;
  place_url: string;
}

const { kakao } = window as any;

export default function Map(props: propsType) {
  // ��Ŀ�� ��� �迭
  let markers: any[] = [];
  const { posts } = usePosts();

  console.log(posts);

  type Location = {
    placePosition: string;
    address_name: string;
    road_address_name: string;
  };

  useEffect(() => {
    const mapContainer = document.getElementById('map');
    const mapOption = {
      center: new kakao.maps.LatLng(37.566826, 126.9786567), // current coordinate
      level: 3, // ������ Ȯ�� ����
    };

    // map init
    const map = new kakao.maps.Map(mapContainer, mapOption);

    // location search init
    const ps = new kakao.maps.services.Places();

    // �˻� ��� ����̳� ��Ŀ�� Ŭ������ �� ��Ҹ��� ǥ���� ���������츦 �����մϴ�
    const infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });

    // Ű����� ��Ҹ� �˻��մϴ�
    searchPlaces();

    // Ű���� �˻��� ��û�ϴ� �Լ��Դϴ�
    function searchPlaces() {
      let keyword = props.searchKeyword;
      if (!keyword.replace(/^\s+|\s+$/g, '')) {
        // console.log('?��?��?���? ?��?��?��주세?��!');
        return false;
      }

      // ��Ұ˻� ��ü�� ���� Ű����� ��Ұ˻��� ��û�մϴ�
      ps.keywordSearch(keyword, placesSearchCB);
    }

    function isPetExists(currentLocation: Location) {
      const targetLocations = posts?.map(
        (aPost) => aPost.postLocation.location
      );
      const targetRoadLocations = posts?.map(
        (aPost) => aPost.postLocation.roadLocation
      );
      const targetExtraLocations = posts?.map(
        (aPost) => aPost.postLocation.extraLocation
      );

      console.log('currentLocation', currentLocation);
      const isLocationMatch = targetLocations.includes(
        currentLocation.address_name
      );
      const isRoadLocationMatch = targetRoadLocations.includes(
        currentLocation.road_address_name
      );
      // const isExtraLocationMatch =
      //   targetExtraLocations.includes(currentLocation.);

      if (isLocationMatch || isRoadLocationMatch) return true;

      return false;
    }

    // ��Ұ˻��� �Ϸ���� �� ȣ��Ǵ� �ݹ��Լ� �Դϴ�
    function placesSearchCB(data: any, status: any, pagination: any) {
      if (status === kakao.maps.services.Status.OK) {
        // ���������� �˻��� �Ϸ������
        // �˻� ��ϰ� ��Ŀ�� ǥ���մϴ�
        displayPlaces(data);

        // paging number
        displayPagination(pagination);
      } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
        alert('�˻� ����� �������� �ʽ��ϴ�.');
        return;
      } else if (status === kakao.maps.services.Status.ERROR) {
        alert('�˻� ��� �� ������ �߻��߽��ϴ�.');
        return;
      }
    }

    // �˻� ��� ��ϰ� ��Ŀ�� ǥ���ϴ� �Լ��Դϴ�
    function displayPlaces(places: string | any[]) {
      console.log('places', places);

      const listEl = document.getElementById('places-list');
      let resultEl = document.getElementById('search-result');
      let fragment = document.createDocumentFragment();
      let bounds = new kakao.maps.LatLngBounds();

      // �˻� ��� ��Ͽ� �߰��� �׸���� �����մϴ�
      listEl && removeAllChildNods(listEl);

      // ������ ǥ�õǰ� �ִ� ��Ŀ�� �����մϴ�
      removeMarker();

      for (var i = 0; i < places.length; i++) {
        // ��Ŀ�� �����ϰ� ������ ǥ���մϴ�
        let placePosition = new kakao.maps.LatLng(places[i].y, places[i].x);
        let address_name = places[i].address_name;
        let road_address_name = places[i].road_address_name;

        // console.log(placePosition);
        let marker = addMarker(
          { placePosition, address_name, road_address_name },
          i,
          undefined
        );
        let itemEl = getListItem(i, places[i]); // �˻� ��� �׸� Element�� �����մϴ�

        // �˻��� ��� ��ġ�� �������� ���� ������ �缳���ϱ�����
        // LatLngBounds ��ü�� ��ǥ�� �߰��մϴ�
        bounds.extend(placePosition);

        // ��Ŀ�� �˻���� �׸� mouseover ������
        // �ش� ��ҿ� ���������쿡 ��Ҹ��� ǥ���մϴ�
        // mouseout ���� ���� ���������츦 �ݽ��ϴ�
        (function (marker, title) {
          kakao.maps.event.addListener(marker, 'mouseover', function () {
            displayInfowindow(marker, title);
          });

          kakao.maps.event.addListener(marker, 'mouseout', function () {
            infowindow.close();
          });

          itemEl.onmouseover = function () {
            displayInfowindow(marker, title);
          };

          itemEl.onmouseout = function () {
            infowindow.close();
          };
        })(marker, places[i].place_name);

        fragment.appendChild(itemEl);
      }

      // �˻���� �׸���� �˻���� ��� Element�� �߰��մϴ�
      listEl && listEl.appendChild(fragment);

      if (resultEl) {
        resultEl.scrollTop = 0;
      }

      // �˻��� ��� ��ġ�� �������� ���� ������ �缳���մϴ�
      map.setBounds(bounds);
    }

    // �˻���� �׸��� Element�� ��ȯ�ϴ� �Լ��Դϴ�
    function getListItem(index: number, places: placeType) {
      const el = document.createElement('li');
      let itemStr = `
				<div class="info">
					<span class="marker marker_${index + 1}"></span>
					<a href="${places.place_url}">
						<h5 class="info-item place-name">${places.place_name}</h5>
						${
              places.road_address_name
                ? `<span class="info-item road-address-name">${places.road_address_name}</span>
								<span class="info-item address-name">${places.address_name}</span>`
                : `<span class="info-item address-name">${places.address_name}</span>`
            }
						<span class="info-item tel">${places.phone}</span>
					</a>
				</div>
			`;

      el.innerHTML = itemStr;
      el.className = 'item';

      return el;
    }

    // ��Ŀ�� �����ϰ� ���� ���� ��Ŀ�� ǥ���ϴ� �Լ��Դϴ�
    function addMarker(location: Location, idx: number, title: undefined) {
      let normalImageSrc =
        'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png';
      let petImgSrc =
        'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png';

      // Note: marker reference: https://apis.map.kakao.com/web/sample/markerWithCustomOverlay/

      // let imageSize = new kakao.maps.Size(36, 37);
      let imageSize = new kakao.maps.Size(64, 69);

      let imgOptions = {
        spriteSize: new kakao.maps.Size(36, 69),
        // spriteOrigin: new kakao.maps.Point(0, idx * 46 + 10),
        offset: new kakao.maps.Point(27, 69),
      };

      // console.log(isPetExists(location));
      const imageSrc = isPetExists(location) ? petImgSrc : normalImageSrc;

      let markerImage = new kakao.maps.MarkerImage(
        // imageSrc,
        // petImgSrc,
        normalImageSrc,
        imageSize,
        imgOptions
      );

      let marker = new kakao.maps.Marker({
        position: location.placePosition, // 마커?�� ?���?
        image: markerImage,
      });

      marker.setMap(map); // ���� ���� ��Ŀ�� ǥ���մϴ�
      markers.push(marker); // �迭�� ������ ��Ŀ�� �߰��մϴ�

      return marker;
    }

    // ���� ���� ǥ�õǰ� �ִ� ��Ŀ�� ��� �����մϴ�
    function removeMarker() {
      for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
      }
      markers = [];
    }

    // �˻���� ��� �ϴܿ� ��������ȣ�� ǥ�ô� �Լ��Դϴ�
    function displayPagination(pagination: {
      last: number;
      current: number;
      gotoPage: (arg0: number) => void;
    }) {
      const paginationEl = document.getElementById('pagination') as HTMLElement;
      let fragment = document.createDocumentFragment();
      let i;

      // ������ �߰��� ��������ȣ�� �����մϴ�
      while (paginationEl.hasChildNodes()) {
        paginationEl.lastChild &&
          paginationEl.removeChild(paginationEl.lastChild);
      }

      for (i = 1; i <= pagination.last; i++) {
        const el = document.createElement('a') as HTMLAnchorElement;
        el.href = '#';
        el.innerHTML = i.toString();

        if (i === pagination.current) {
          el.className = 'on';
        } else {
          el.onclick = (function (i) {
            return function () {
              pagination.gotoPage(i);
            };
          })(i);
        }

        fragment.appendChild(el);
      }
      paginationEl.appendChild(fragment);
    }

    // �˻���� ��� �Ǵ� ��Ŀ�� Ŭ������ �� ȣ��Ǵ� �Լ��Դϴ�
    // ���������쿡 ��Ҹ��� ǥ���մϴ�
    function displayInfowindow(marker: any, title: string) {
      const content =
        '<div style="padding:5px;z-index:1;" class="marker-title">' +
        title +
        '</div>';

      infowindow.setContent(content);
      infowindow.open(map, marker);
    }

    // �˻���� ����� �ڽ� Element�� �����ϴ� �Լ��Դϴ�
    function removeAllChildNods(el: HTMLElement) {
      while (el.hasChildNodes()) {
        el.lastChild && el.removeChild(el.lastChild);
      }
    }
  }, [props.searchKeyword]);

  return (
    <div className="map-container">
      <div className="flex-grid flex-grid--wrap">
        <div id="map" className="map"></div>
        <div id="search-result" className="search-result">
          <p className="result-text">
            <span className="result-keyword">{props.searchKeyword}</span>
            �˻� ���
          </p>
          <div className="scroll-wrapper">
            <ul id="places-list" className="places-list"></ul>
          </div>
          <div
            id="pagination"
            className="pagination flex-grid flex-grid--center"
          ></div>
        </div>
      </div>
    </div>
  );
}
