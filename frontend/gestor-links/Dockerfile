FROM nginx:alpine
RUN rm -rf /etc/nginx/conf.d
COPY dist/gestor-links/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
