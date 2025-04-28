{
  description = "The flake used for building, checking and developing this school project.";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, ... } @ inputs: flake-utils.lib.eachDefaultSystem ( system:
    let

      pkgs = import nixpkgs { inherit system; };
      
    in rec {

      formater = nixpkgs.legacyPackages.${system}.nixpkgs-fmt;

      checks.default = self.packages.${system}.default;

      devShells.default = pkgs.mkShell {
        buildInputs = with pkgs; [ 
          act # Run GitHub Actions locally.
        ];
      };

      packages.default = pkgs.stdenv.mkDerivation rec {
        name = "default";
        src = ./.;
        buildInputs = with pkgs; [ ];

        buildPhase = ''
          runHook preBuild

          # ...

          runHook postBuild
        '';

        installPhase = ''
          runHook preInstall
          
          mkdir --parents $out

          # ...
            
          runHook postInstall
        '';
      };
    }
  );
}
