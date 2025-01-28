import { Link } from "react-router";
import { Button, Carousel } from "antd";

import i18n from "../i18n/config.js";


export function Component() {
    const colorMode = localStorage.getItem("colorMode");
    const imgColor = colorMode === "dark" ? "light" : "dark";
    const isAuth = localStorage.getItem("jwtLifetime");
    let className = "flex flex-col ";

    return (
        <div className={colorMode === "dark" ? className + "text-white" : className}>
            <nav className="flex flex-row justify-between m-2">
                <span className="text-2xl">Bugtracker</span>

                {isAuth
                    ? <Link to="projects">
                        <Button>{i18n.t("projectsList_header")}</Button>
                    </Link>
                    : <Link to="login">
                        <Button>{i18n.t("btn_logIn")}</Button>
                    </Link>
                }
            </nav>

            <main id="landing-main">
                <p className="text-6xl text-center">{i18n.t("landing")}</p>

                <Carousel dotPosition="top">
                    <GetSlide item="projects" imgColor={imgColor}/>
                    <GetSlide item="project" imgColor={imgColor}/>
                    <GetSlide item="issues" imgColor={imgColor}/>
                    <GetSlide item="issue" imgColor={imgColor}/>
                </Carousel>
            </main>

            <footer className="my-2 self-center">
                © {new Date().getFullYear()} Haenes
            </footer>
        </div>
    );
}


function GetSlide({ item, imgColor }) {
    let src = "images/";

    if (item.startsWith("i")) {
        src += "issue/";
    } else {
        src += "project/";
    }
    // Example: images/issue/issues.
    src += item;

    return (
        <picture>
            <source width={320} srcSet={`${src}-mobile-${imgColor}.webp`} media="(max-width: 430px)"/>
            <source width={700} srcSet={`${src}-${imgColor}-w700.webp`} media="(max-width: 820px)"/>
            <source width={1366} srcSet={`${src}-${imgColor}.webp`} media="(min-width: 1440px)"/>

            <img width={1000} alt={`${item} page example`} src={`${src}-${imgColor}-w1000.webp`}/>
        </picture>
    );
}
