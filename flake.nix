{
  description = "The flake used for building, checking and developing this project.";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/24.11";
    flake-utils.url = "github:numtide/flake-utils";
    treefmt-nix = {
      url = "github:numtide/treefmt-nix";
      inputs = {
        nixpkgs.follows = "nixpkgs";
      };
    };
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      treefmt-nix,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let

        pkgs = import nixpkgs { inherit system; };

        inherit (nixpkgs) lib;

        treefmtEval = treefmt-nix.lib.evalModule pkgs ./.config/treefmt.nix;

      in
      rec {

        # ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Nix Build ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ #

        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_23
            act # Run GitHub Actions locally.
          ];
        };

        # ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Nix Build ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ #

        packages.default =
          let

            packageJson = builtins.fromJSON (builtins.readFile ./package.json);

          in
          pkgs.buildNpmPackage {
            pname = packageJson.name;
            inherit (packageJson) version;

            forceGitDeps = true;

            src = ./.;

            npmDepsHash = "sha256-dowdrnkhoA1lbnBXxgiqfM7N1F2KzVqNvc4Jx/zyonI=";
            nodejs = pkgs.nodejs_23;

            makeCacheWritable = true;
            dontNpmBuild = true;
            npmPackFlags = [ "--ignore-scripts" ];

            doInstallCheck = true;

            passthru.updateScript = pkgs.nix-update-script { };

            meta = {
              inherit (packageJson) description homepage;
              mainProgram = "markdown-documentation-generator";
            };
          };

        # ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Nix Flake Check ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ #

        checks = packages // {
          formatting = treefmtEval.config.build.check self;
        };

        # ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Nix Fmt ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ #

        formatter = treefmtEval.config.build.wrapper;

        # ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ #
      }
    );
}
