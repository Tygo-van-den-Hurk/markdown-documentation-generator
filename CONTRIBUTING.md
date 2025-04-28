> In here we describe how to contribute, and the guidelines we set.

[< Back to main README...](./README.md)

- [How to Develop](#how-to-develop)
  - [Continuous Integration \& Continuous Delivery (CI/CD)](#continuous-integration--continuous-delivery-cicd)

# How to Develop

There are several actions you might want to perform. Such as: build the binary, compile the report, or gather the files for submission to `Momotor`. For that I've build scripts. So all you have to do, is run the command, and then it should just do everything for you, including tests. First of all, make sure you have `Nix` installed. Check by running:

```BASH
nix --version
```

Make sure that `Nix` is above version `2.16.0`, otherwise I cannot guarantee that this will work. There is a devcontainer for those who are can't or don't have `Nix` installed. Look at the documentation for your IDE on how to work with devcontainers.

## Continuous Integration & Continuous Delivery (CI/CD)

The code your write will be automagically tested and deployed. If a mistake was made then these checks will fail, denying merger with the `main` branch.
