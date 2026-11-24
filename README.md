# 핀핀볼

참가자 이름을 쉼표나 줄바꿈으로 구분해 입력하고 **시작**을 누르면 핀볼로 당첨자를 뽑습니다. 같은 이름에 구슬을 세 개 배정하려면 `수박*3`으로 입력합니다.

GitHub Pages의 게시 경로는 `main` 브랜치의 `/ (root)`입니다. 배포 파일이 포함되어 있어 `python3 -m http.server`로 로컬에서도 실행할 수 있습니다. 게임 코어나 스타일을 수정했을 때는 `corepack yarn install --frozen-lockfile`과 `corepack yarn build`로 `game/`을 갱신합니다.

[lazygyu의 Marble Roulette](https://github.com/lazygyu/roulette/tree/87298bf174e10aa4f3a7cd8b9d9faa8d9c6ef505)를 바탕으로 만들었습니다. 원본 코드는 [MIT 라이선스](LICENSE)를 따르며 물리 엔진 라이선스는 [licenses](licenses/)에 있습니다.
