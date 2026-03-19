import React from "react";
import Header from "../Component/Header";
import Lefthomepagepart from "../Component/Lefthomepagepart";
import { useParams } from "react-router-dom";

export default function Otherpage({ setLoading }) {
  const { searchparam } = useParams();
  return (
    <>
      <Header setLoading={setLoading} />
      <Lefthomepagepart searchparam={searchparam} />
    </>
  );
}
