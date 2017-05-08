
loadToken();

if (api_logged_in) {
    viewController.push(new MainView());
} else {
    viewController.push(new LoginView());
}
