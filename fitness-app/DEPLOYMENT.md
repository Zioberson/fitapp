# Przewodnik Wdrożenia Aplikacji FitTrack Pro

Ten dokument zawiera instrukcje krok po kroku, jak zbudować i wdrożyć aplikację FitTrack Pro przy użyciu Expo.

## Krok 1: Wymagania Wstępne

Przed rozpoczęciem upewnij się, że masz zainstalowane następujące narzędzia:
- [Node.js](https://nodejs.org/en/) (wersja LTS)
- [Expo CLI](https://docs.expo.dev/get-started/installation/):
  ```bash
  npm install -g expo-cli
  ```
- Konto na [Expo.dev](https://expo.dev/)

## Krok 2: Konfiguracja Projektu

1.  **Sklonuj Repozytorium:**
    Upewnij się, że masz najnowszą wersję kodu na swoim lokalnym komputerze.

2.  **Zainstaluj Zależności:**
    Przejdź do katalogu `fitness-app` i uruchom polecenie:
    ```bash
    npm install
    ```

3.  **Skonfiguruj Zmienne Środowiskowe:**
    - Skopiuj plik `.env.example` i zmień jego nazwę na `.env`.
    - Wypełnij plik `.env` swoimi kluczami konfiguracyjnymi Firebase. Znajdziesz je w konsoli Firebase swojego projektu.

4.  **Zaktualizuj `app.json`:**
    - Otwórz plik `app.json`.
    - **Ważne:** Zmień wartości `bundleIdentifier` (dla iOS) i `package` (dla Android) na unikalne identyfikatory dla Twojej aplikacji. Zastąp `com.yourcompany.fittrackpro` właściwą wartością.
    - Zaktualizuj `extra.eas.projectId` na ID Twojego projektu z Expo Application Services (EAS).

## Krok 3: Budowanie Aplikacji (Build)

Użyjemy Expo Application Services (EAS) do zbudowania aplikacji. EAS to usługa chmurowa od Expo, która upraszcza proces budowania i przesyłania aplikacji do sklepów.

1.  **Zaloguj się na swoje konto Expo:**
    ```bash
    expo login
    ```

2.  **Skonfiguruj projekt EAS:**
    Jeśli robisz to po raz pierwszy, uruchom:
    ```bash
    eas build:configure
    ```
    Postępuj zgodnie z instrukcjami, aby wygenerować plik `eas.json`.

3.  **Rozpocznij proces budowania:**
    - **Dla Androida:**
      ```bash
      eas build --platform android
      ```
    - **Dla iOS:**
      ```bash
      eas build --platform ios
      ```

    EAS poprosi Cię o podanie informacji o Twoim koncie deweloperskim (Apple/Google) i zajmie się resztą, włączając w to zarządzanie certyfikatami.

4.  **Pobierz Build lub Wygeneruj Kod QR:**
    Po zakończeniu budowania, w panelu Expo (na stronie internetowej) znajdziesz link do pobrania pliku `.apk` (Android) lub `.ipa` (iOS). Możesz również wygenerować kod QR, który pozwoli na szybką instalację na urządzeniu testowym.

## Krok 4: Wdrożenie na Serwery Expo (Development Build)

Jeśli chcesz szybko przetestować aplikację na fizycznym urządzeniu bez budowania pełnej wersji produkcyjnej, możesz stworzyć "development build".

1.  **Utwórz development build:**
    ```bash
    eas build --profile development
    ```

2.  **Zainstaluj build na swoim urządzeniu:**
    Użyj wygenerowanego kodu QR, aby zainstalować aplikację.

3.  **Uruchom serwer deweloperski:**
    ```bash
    npm start
    ```
    Otwórz aplikację Expo Go na swoim telefonie i zeskanuj kod QR z terminala, aby połączyć się z serwerem.

---

## Krok 5: Przygotowanie do Publikacji w Sklepach (App Store & Google Play)

Zanim prześlesz swoją aplikację do recenzji, musisz przygotować szereg zasobów graficznych i metadanych.

### Niezbędne Zasoby Graficzne:

1.  **Ikona Aplikacji:**
    -   **Format:** PNG
    -   **Rozmiar:** `1024x1024` pikseli. To jest główny plik, z którego generowane są mniejsze ikony.
    -   **Plik w projekcie:** `assets/icon.png` (upewnij się, że jest w wysokiej rozdzielczości).

2.  **Ekran Powitalny (Splash Screen):**
    -   **Format:** PNG
    -   **Plik w projekcie:** `assets/splash.png`. Powinien być prosty i dobrze wyglądać na różnych rozmiarach ekranu.

3.  **Zrzuty Ekranu (Screenshots):**
    -   Musisz dostarczyć zrzuty ekranu dla różnych rozmiarów urządzeń.
    -   **Wskazówka:** Najprościej jest uruchomić aplikację na symulatorach (iOS Simulator, Android Emulator) o różnych rozmiarach i zrobić zrzuty ekranu kluczowych funkcji aplikacji.
    -   **Wymagane rozmiary dla iOS (przykładowe):**
        -   6.5" (np. iPhone 11 Pro Max, 12 Pro Max): `1242 x 2688` px
        -   5.5" (np. iPhone 8 Plus): `1242 x 2208` px
        -   iPad Pro (12.9"): `2048 x 2732` px
    -   **Wymagane rozmiary dla Androida:**
        -   Google Play jest bardziej elastyczny, ale zaleca się dostarczenie zrzutów dla telefonów i tabletów (7" i 10").

### Niezbędne Metadane (Teksty):

Przygotuj następujące informacje, które będziesz musiał(a) wprowadzić w panelach App Store Connect i Google Play Console:

1.  **Nazwa Aplikacji:**
    -   Nazwa, która będzie widoczna w sklepie (np. `FitTrack Pro`).
    -   Maksymalnie 30 znaków.

2.  **Podtytuł (iOS) / Krótki Opis (Android):**
    -   Krótkie, chwytliwe zdanie podsumowujące aplikację.
    -   iOS: 30 znaków, Android: 80 znaków.

3.  **Pełny Opis:**
    -   Szczegółowy opis funkcji, korzyści i przeznaczenia aplikacji.
    -   Maksymalnie 4000 znaków.

4.  **Słowa Kluczowe (Keywords):**
    -   Lista słów, po których użytkownicy mogą znaleźć Twoją aplikację (np. `fitness`, `trener personalny`, `dieta`, `trening`).
    -   Maksymalnie 100 znaków (łącznie, oddzielone przecinkami).

5.  **URL Polityki Prywatności:**
    -   Link do strony internetowej z polityką prywatności Twojej aplikacji. Jest to **wymagane** przez oba sklepy.

6.  **Kategoria:**
    -   Wybierz główną i (opcjonalnie) dodatkową kategorię (np. `Zdrowie i Fitness`).

7.  **Informacje Kontaktowe:**
    -   Adres e-mail, strona internetowa (opcjonalnie).

Przygotowanie tych zasobów z góry znacznie przyspieszy proces przesyłania aplikacji do sklepów.