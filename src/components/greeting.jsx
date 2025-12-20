import React from "react";
import styled from "styled-components";
import { Divider } from "antd";
import {
  GROOM_NAME,
  GROOM_FATHER_NAME,
  GROOM_MOTHER_NAME,
  BRIDE_NAME,
  BRIDE_FATHER_NAME,
  BRIDE_MOTHER_NAME,
} from "../../config";
import Flower from "../assets/flower1.png";

const Wrapper = styled.div`
  padding-top: 42px;
  margin: 0 auto;
  width: 70%;
`;

const Title = styled.p`
  font-size: 1rem;
  color: var(--title-color);
  font-weight: bold;
  opacity: 0.85;
  margin-bottom: 0;
  text-align: center;
`;

const Content = styled.p`
  font-size: 0.72rem;
  line-height: 1.75;
  opacity: 0.75;
  margin-bottom: 16px;
  width: 100%;
  text-align: center;
`;

const GroomBride = styled.p`
  font-size: 0.875rem;
  line-height: 1.75;
  opacity: 0.85;
  margin-bottom: 0px;
  width: 100%;
  text-align: center;
`;

const Image = styled.img`
  display: block;
  margin: 0 auto;
  width: 1.375rem;
  padding-bottom: 42px;
`;

const Greeting = () => {
  return (
    <Wrapper>
      <Divider style={{ marginTop: 32, marginBottom: 32 }} plain>
        <Title data-aos="fade-up">저 박상인, 프로포즈합니다</Title>
      </Divider>
      <Image data-aos="fade-up" src={Flower} />
      <Content data-aos="fade-up">
        사랑은 우리의 내면적 결핍을 드러내는 순간에서 시작되지만,
        <br />
        바로 그 불완전함이 우리를 진정으로 연결짓는 기술이라 생각해. 
        <br />
        승현이 너를 처음 만났을 때, 나는 내 부족한 부분을 네가 부드럽게 채워주는 그 마법을 느꼈어.
        <br />
        <br />
        일상의 사소한 대화와 손길 속에서 우리의 사랑은 점점 더 풍성해졌고,
        <br />
        서로의 결점을 솔직히 드러내며 받아들이고, 그것을 함께 다듬어가는 과정이
        <br />
        지금의 자리를 만들어 줬다고 믿어.
        <br />
        <br />
        그래서 너와 결혼하고 싶어.
        <br />
        네가 내 삶의 가장 든든한 버팀목이자, 영원히 함께할 짝이 되어줄 이 자리에서
        <br />
        이 사랑을 평생의 서약으로 맺고 싶어.
      </Content>
    </Wrapper>
  );
};

export default Greeting;
