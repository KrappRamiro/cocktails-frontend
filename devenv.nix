{
  pkgs,
  lib,
  config,
  inputs,
  ...
}: {
  # https://devenv.sh/languages/
  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_24;
    npm.enable = true;
  };
}
