export const HeaderTemplate = `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>Email Template</title>
      <style>
          /* Fonts */
          @import url('https://fonts.googleapis.com/css?family=Work+Sans:200,300,400,500,600,700');
  
          /* Global Styles */
          body {
              margin: 0;
              padding: 0;
              font-family: 'Work Sans', sans-serif;
              background-color: #f1f1f1;
          }
  
          .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #fff;
              border-radius: 5px;
              overflow: hidden;
          }
  
          /* Header */
          .header {
              background-color: #6584DB;
              padding: 20px;
              text-align: center;
          }
  
          .header img {
              max-width: 150px;
              height: auto;
          }
  
          /* Content */
          .content {
              padding: 20px;
              text-align: left;
          }
  
          .content p {
              font-size: 14px;
              line-height: 1.6;
              color: #414042;
              margin-bottom: 15px;
          }
  
          .content b {
              color: #22489e;
          }
  
          /* Footer */
          .footer {
              text-align: center;
              background-color: #6584DB;
              padding: 15px 0;
          }
  
          .footer p {
              margin: 0;
              color: #fff;
              font-size: 12px;
          }
  
          .social-links {
              margin-top: 10px;
          }
  
          .social-links a {
              display: inline-block;
              margin: 0 5px;
          }
  
          .social-links img {
              max-width: 30px;
              height: auto;
          }
      </style>
  </head>
  <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
              <a href="{{app_url}}" target="_blank"><img src="{{app_url}}svg-icon/svgicon.png" alt="Logo"></a>
        </div>
`;
