import axios from "axios";
import { CustomError, MissingParamError } from "../common/utils.js";

/**
 * WakaTime data fetcher.
 *
 * @param {{username: string, api_domain: string }} props Fetcher props.
 * @returns {Promise<WakaTimeData>} WakaTime data response.
 */
// Allow-list of permitted WakaTime API domains
const ALLOWED_API_DOMAINS = ["wakatime.com"];
// Add more allowed domains as needed, e.g. for enterprise customers
const USERNAME_REGEX = /^[A-Za-z0-9-_]+$/;

const fetchWakatimeStats = async ({ username, api_domain }) => {
  if (!username) {
    throw new MissingParamError(["username"]);
  }
  if (!USERNAME_REGEX.test(username)) {
    throw new CustomError(
      "Invalid username format.",
      "WAKATIME_USERNAME_INVALID",
    );
  }
  let apiHost = "wakatime.com";
  if (api_domain) {
    // Validate against allowlist
    const sanitizedDomain = api_domain.replace(/\/$/gi, "");
    if (!ALLOWED_API_DOMAINS.includes(sanitizedDomain)) {
      throw new CustomError(
        `Invalid API domain '${sanitizedDomain}'.`,
        "WAKATIME_API_DOMAIN_INVALID",
      );
    }
    apiHost = sanitizedDomain;
  }

  try {
    const { data } = await axios.get(
      `https://${apiHost}/api/v1/users/${username}/stats?is_including_today=true`,
    );

    return data.data;
  } catch (err) {
    if (err.response.status < 200 || err.response.status > 299) {
      throw new CustomError(
        `Could not resolve to a User with the login of '${username}'`,
        "WAKATIME_USER_NOT_FOUND",
      );
    }
    throw err;
  }
};

export { fetchWakatimeStats };
export default fetchWakatimeStats;
