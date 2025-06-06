import Container from "./Container";
import { H2 } from "./custom/header";
import DiscordIcon from "./icons/DiscordIcon";
import EmailIcon from "./icons/EmailIcon";
import GitHubIcon from "./icons/GitHubIcon";

import siteConfig from "@/config/siteConfig";
import { getContributorsCount, getRepoInfo } from "@/lib/getGitHubData";
import { useEffect, useState } from "react";

const Stat = ({ title, value, ...props }) => {
  return (
    <div {...props}>
      <span className="text-4xl sm:text-6xl font-bold text-secondary">
        {value}
      </span>
      <p className="text-lg font-medium sm:mt-2">{title}</p>
    </div>
  );
};

const IconButton = ({ Icon, text, href, ...props }) => {
  return (
    <div {...props}>
      <a
        className="rounded border border-secondary px-5 py-3 text-primary dark:text-primary-dark flex items-center hover:bg-secondary hover:text-primary dark:hover:text-primary transition-all duration-200"
        href={href}
      >
        <Icon className="w-6 h-6 mr-2" />
        {text}
      </a>
    </div>
  );
};

export default function Community() {
  const [repoInfo, setRepoInfo] = useState<any>();
  const [contributorsCount, setContributorsCount] = useState("");

  useEffect(() => {
    //  This runs on client side and it's unlikely that users
    //  will exceed the GitHub API  usage limit,  but added a
    //  handling for that just in case.

    getRepoInfo().then((res) => {
      if (res.success) {
        res.info.then((data) => setRepoInfo(data));
      } else {
        //  If the request fail e.g API usage limit, use
        //  a placeholder
        setRepoInfo({ stargazers_count: "+2k" });
      }
    });

    getContributorsCount().then((res) => {
      if (res.success) {
        setContributorsCount(res.count);
      } else {
        setContributorsCount("+70");
      }
    });
  }, []);

  return (
    <Container>
      <H2
        className="text-primary dark:text-primary-dark text-center sm:mb-4"
        id="Community"
      >
        Community
      </H2>
      <p className="text-lg opacity-75">
        We are growing. Get in touch or become a contributor!
      </p>
      <div className="flex justify-center mt-8 text-amber-400">
        <Stat
          title="Stars on GitHub"
          value={
            <span className="text-5xl">
              {" "}
              {/* Adjust font size using Tailwind's text-sm class */}
              {repoInfo?.stargazers_count}
            </span>
          }
          className="mr-10"
        />
        <Stat
          title="Contributors"
          value={
            <span className="text-5xl">
              {" "}
              {/* Adjust font size using Tailwind's text-sm class */}
              {contributorsCount}
            </span>
          }
        />
      </div>
      <div className="flex flex-wrap justify-center mt-4">
        <IconButton
          Icon={GitHubIcon}
          text="Star PortalJS on GitHub"
          className="sm:mr-4 mb-4 w-full sm:w-auto"
          href={siteConfig.github}
        />
        <IconButton
          Icon={DiscordIcon}
          text="Join the Discord server"
          className="sm:mr-4 mb-4 w-full sm:w-auto"
          href={siteConfig.discord}
        />
        {/* <IconButton
          Icon={EmailIcon}
          text="Subscribe to the PortalJS newsletter"
          className="w-full sm:w-auto"
          href="#hero"
        /> */}
      </div>
    </Container>
  );
}
