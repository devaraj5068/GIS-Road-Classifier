import { PipelineConfig, GeneratedCodeBlock } from "./types";

export function getCodeBlocks(config: PipelineConfig): GeneratedCodeBlock[] {
  const size = config.imageSize;
  const batch = config.batchSize;
  const epochs = config.epochs;
  const lr = config.learningRate;
  const opt = config.optimizer;
  const split = config.valSplit;
  const dropout = config.dropoutRate;
  const augmentEnabled = config.augmentation;

  // Let's create the project layout markdown
  const folderStructureCode = `# GIS Road Classification Codebase Architecture
This document describes the recommended dataset layout and directory organization for compiling, training, and predicting with your Python CNN.

## 📁 Suggested Directory Tree
\`\`\`text
road_classification_project/
│
├── requirements.txt           # Python dependency lists
├── dataset.py                # Preprocessing and dataset ingestion generator
├── model.py                  # ResNet-style custom CNN Architecture
├── train.py                  # Training pipeline and history plotting
├── inference.py              # OpenCV verification and image prediction
└── dataset/                  # Primary GIS imagery workspace
    ├── highway/              # Multi-lane, structural dividers, asphalt
    │   ├── sat_hw_01.png
    │   └── sat_hw_02.png
    ├── street_road/          # Suburban grids, flanking buildings, sidewalks
    │   ├── sat_st_01.png
    │   └── sat_st_02.png
    ├── village_road/         # High foliage canopy, narrow paving, homesteads
    │   ├── sat_vg_01.png
    │   └── sat_vg_02.png
    ├── dirt_road/            # Rugged gravel paths, clay tracks, unpaved
    │   ├── sat_dt_01.png
    │   └── sat_dt_02.png
    └── concrete_road/        # Medium-width light gray slabs & visible seams
        ├── sat_cc_01.png
        └── sat_cc_02.png
\`\`\`

## 📊 Recommended Dataset Specifications
- **Format**: Lossless \`.png\` or high-quality \`.jpg\` satellite imagery screenshots.
- **Image Count**: Aim for at least 300 to 500 images per class for balanced accuracy.
- **Image Dimensions**: Recommended \`${size}x${size}\` pixels (configured in setup).
- **Color Profile**: RGB (3 channels) for comprehensive feature mapping of foliage, asphalt, and dirt grids.
`;

  // Requirements text
  const requirementsCode = `tensorflow>=2.15.0
opencv-python>=4.8.0
numpy>=1.24.0
matplotlib>=3.7.0
scikit-learn>=1.3.0
pandas>=2.0.0
pillow>=10.0.0
`;

  // Preprocessing script (dataset.py) using OpenCV and TensorFlow
  const datasetCode = `"""
dataset.py - GIS Satellites Imagery ingestion and preprocessing pipeline.
Features: OpenCV image reading, resizing to ${size}x${size}, color adjustments, 
and TensorFlow dataset loading configurations.
"""

import os
import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.utils import image_dataset_from_directory

def verify_and_clean_images(data_dir, target_size=(${size}, ${size})):
    """
    Scans the dataset folder, verifies each file with OpenCV to ensure it's not corrupt,
    and removes or reports invalid file streams.
    """
    classes = ["highway", "street_road", "village_road", "dirt_road", "concrete_road"]
    corrupt_count = 0
    total_count = 0
    
    print("📋 Starting OpenCV integrity check on dataset directory...")
    for cls in classes:
        cls_path = os.path.join(data_dir, cls)
        if not os.path.exists(cls_path):
            print(f"⚠️ Warning: Missing class subfolder: {cls_path}")
            continue
            
        for file in os.listdir(cls_path):
            if file.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff')):
                img_path = os.path.join(cls_path, file)
                total_count += 1
                try:
                    # Load image using OpenCV
                    img = cv2.imread(img_path)
                    if img is null or img.size == 0:
                        raise ValueError("OpenCV returned empty pixel matrix")
                        
                    # Test resizing module
                    resized = cv2.resize(img, target_size)
                except Exception as e:
                    print(f"❌ Corrupt file detected and isolated: {img_path}. Error: {e}")
                    corrupt_count += 1
                    # It is typical to move or delete these during production pipeline setups
                    # os.remove(img_path)

    print(f"✅ OpenCV Ingestion Check Complete. Verified {total_count} files, isolated {corrupt_count} errors.")

def load_data_pipelines(data_dir, batch_size=${batch}, val_split=${split}, seed=42):
    """
    Loads training and validation tensorflow datasets from directories.
    Provides standard resizing, normalization and batch configurations.
    """
    target_size = (${size}, ${size})
    
    print("🔄 Standardizing GIS data streams...")
    # Seed value guarantees training/testing partitions are reproducible
    train_ds = image_dataset_from_directory(
        data_dir,
        validation_split=val_split,
        subset="training",
        seed=seed,
        image_size=target_size,
        batch_size=batch_size,
        label_mode="categorical" # Multi-class categorizer (5 labels)
    )

    val_ds = image_dataset_from_directory(
        data_dir,
        validation_split=val_split,
        subset="validation",
        seed=seed,
        image_size=target_size,
        batch_size=batch_size,
        label_mode="categorical"
    )
    
    class_names = train_ds.class_names
    print(f"📊 Class targets discovered: {class_names}")
    
    # Configure Performance prefecthing and cache rules 
    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.cache().shuffle(1000).prefetch(buffer_size=AUTOTUNE)
    val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)
    
    return train_ds, val_ds, class_names

if __name__ == "__main__":
    # Test execution local workspace
    dataset_path = "./dataset"
    if os.path.exists(dataset_path):
        verify_and_clean_images(dataset_path)
    else:
        print(f"ℹ️ Create a folder named '{dataset_path}' containing subdirectories for training.")
`;

  // CNN Model script (model.py)
  const modelCode = `"""
model.py - Custom CNN Neural Network designed with TensorFlow compile configurations.
Implements scaling buffers, convolution filters, pooling layers, and dropout nodes.
"""

import tensorflow as tf
from tensorflow.keras import layers, models

def build_cnn_classifier(input_shape=(${size}, ${size}, 3), num_classes=5, dropout_rate=${dropout}, use_augmentation=${augmentEnabled}):
    """
    Builds and compiles a tailored Convolutional Neural Network (CNN) 
    for satellite GIS image feature extraction.
    """
    
    # Data Augmentation layer configuration to combat overfitting on satellite feeds
    inputs = layers.Input(shape=input_shape)
    x = inputs
    
    if use_augmentation:
        # Augmentation pipeline operates on the GPU inside TensorFlow graphs
        augment_pipeline = tf.keras.Sequential([
            layers.RandomFlip("horizontal_and_vertical"),
            layers.RandomRotation(0.15),
            layers.RandomContrast(0.1),
            layers.RandomZoom(0.1),
        ])
        x = augment_pipeline(x)
        
    # Scale input values [0, 255] pixels to [0, 1] normalization
    x = layers.Rescaling(1./255)(x)
    
    # 1st Convolution Block
    x = layers.Conv2D(32, (3, 3), padding="same", activation="relu")(x)
    x = layers.BatchNormalization()(x)
    x = layers.MaxPooling2D(pool_size=(2, 2))(x)
    
    # 2nd Convolution Block
    x = layers.Conv2D(64, (3, 3), padding="same", activation="relu")(x)
    x = layers.BatchNormalization()(x)
    x = layers.MaxPooling2D(pool_size=(2, 2))(x)
    
    # 3rd Convolution Block (Deeper GIS features like texture and pavement density)
    x = layers.Conv2D(128, (3, 3), padding="same", activation="relu")(x)
    x = layers.BatchNormalization()(x)
    x = layers.MaxPooling2D(pool_size=(2, 2))(x)
    
    # 4th Convolution Block (Recognizing complex landscape structures)
    x = layers.Conv2D(128, (3, 3), padding="same", activation="relu")(x)
    x = layers.BatchNormalization()(x)
    x = layers.MaxPooling2D(pool_size=(2, 2))(x)
    
    # Fully Connected Dense Classifier Network
    x = layers.Flatten()(x)
    x = layers.Dense(128, activation="relu")(x)
    x = layers.Dropout(dropout_rate)(x)
    
    x = layers.Dense(64, activation="relu")(x)
    x = layers.Dropout(dropout_rate / 2)(x)
    
    # Output layer setup for categorical labels
    outputs = layers.Dense(num_classes, activation="softmax")(x)
    
    model = models.Model(inputs=inputs, outputs=outputs, name="GIS_Road_CNN")
    return model

if __name__ == "__main__":
    # Create test model instance to print architectural schema
    mymodel = build_cnn_classifier()
    mymodel.summary()
`;

  // Training handler (train.py)
  const trainCode = `"""
train.py - Core training execution script.
Assembles the pipelines, compiles hyperparameter loss optimization functions, 
registers telemetry callbacks, and graphs progress charts.
"""

import os
import matplotlib.pyplot as plt
from dataset import load_data_pipelines, verify_and_clean_images
from model import build_cnn_classifier
import tensorflow as tf

# Ingestion configuration
DATASET_DIR = "./dataset"
BATCH_SIZE = ${batch}
EPOCHS = ${epochs}
LEARNING_RATE = ${lr}
OPTIMIZER_NAME = "${opt}"

def run_training():
    if not os.path.exists(DATASET_DIR):
        print(f"❌ Error: Required directory '{DATASET_DIR}' was not found.")
        print("Please structure your images as indicated in the 'dataset_structure.md' block.")
        return

    # Check file integrites prior to neural compiling 
    verify_and_clean_images(DATASET_DIR)
    
    # Load training splits
    train_ds, val_ds, class_names = load_data_pipelines(DATASET_DIR, batch_size=BATCH_SIZE)
    
    # Compile CNN model
    print("🏗️ Compiling custom CNN with configured parameters...")
    model = build_cnn_classifier(input_shape=(${size}, ${size}, 3), num_classes=len(class_names))
    
    # Configure optimizer
    if OPTIMIZER_NAME == "Adam":
        optimizer = tf.keras.optimizers.Adam(learning_rate=LEARNING_RATE)
    elif OPTIMIZER_NAME == "SGD":
        optimizer = tf.keras.optimizers.SGD(learning_rate=LEARNING_RATE, momentum=0.9)
    else:
        optimizer = tf.keras.optimizers.RMSprop(learning_rate=LEARNING_RATE)
        
    model.compile(
        optimizer=optimizer,
        loss="categorical_crossentropy",
        metrics=["accuracy"]
    )
    
    # Define active Callbacks
    checkpoint_cb = tf.keras.callbacks.ModelCheckpoint(
        "best_gis_model.keras",
        save_best_only=True,
        monitor="val_loss",
        verbose=1
    )
    
    early_stop_cb = tf.keras.callbacks.EarlyStopping(
        patience=8,
        restore_best_weights=True,
        monitor="val_loss",
        verbose=1
    )
    
    # Run fit cycle
    print(f"🚀 Launching fit on CNN model (Epochs={EPOCHS}, Batch Size={BATCH_SIZE})...")
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS,
        callbacks=[checkpoint_cb, early_stop_cb]
    )
    
    print("💾 Saving final static model backup...")
    model.save("final_gis_road_model.keras")
    
    # Visualizing loss curves
    plot_training_curves(history)

def plot_training_curves(history):
    acc = history.history['accuracy']
    val_acc = history.history['val_accuracy']
    loss = history.history['loss']
    val_loss = history.history['val_loss']
    epochs_range = range(len(acc))

    plt.figure(figsize=(12, 5))
    
    plt.subplot(1, 2, 1)
    plt.plot(epochs_range, acc, label='Training Accuracy')
    plt.plot(epochs_range, val_acc, label='Validation Accuracy')
    plt.legend(pos='lower right')
    plt.title('GIS Classifier Training & Validation Accuracy')
    plt.grid(True)

    plt.subplot(1, 2, 2)
    plt.plot(epochs_range, loss, label='Training Loss')
    plt.plot(epochs_range, val_loss, label='Validation Loss')
    plt.legend(pos='upper right')
    plt.title('GIS Classifier Training & Validation Loss')
    plt.grid(True)
    
    plt.tight_layout()
    plt.savefig("gis_training_metrics.png")
    print("📈 Save telemetry curves plot to 'gis_training_metrics.png'")
    plt.show()

if __name__ == "__main__":
    run_training()
`;

  // Inference using OpenCV (inference.py)
  const inferenceCode = `"""
inference.py - OpenCV pipeline evaluation script.
Loads the trained Keras CNN, takes a GIS/satellite photo, processes it,
and overlays prediction outputs dynamically on a cv2 image canvas.
"""

import sys
import os
import cv2
import numpy as np
import tensorflow as tf

# The class labels must match the exact alphabetical folder order loaded by dataset.py
CLASSES = ["Concrete Road", "Dirt Road", "Highway", "Street Road", "Village Road"]
IMAGE_SIZE = (${size}, ${size})

def preprocess_gis_image(img_path):
    """
    Reads an image using OpenCV, transcribes channels, and expands axes for Keras.
    """
    if not os.path.exists(img_path):
        raise FileNotFoundError(f"Selected image not found at {img_path}")
        
    # Read the image with OpenCV - defaults to channels (BGR)
    img_bgr = cv2.imread(img_path)
    if img_bgr is None:
         raise ValueError(f"OpenCV could not parse file header at: {img_path}")
         
    # Convert OpenCV standard BGR color profile to RGB
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    
    # Resize to match CNN training bounds
    img_resized = cv2.resize(img_rgb, IMAGE_SIZE)
    
    # Note: tf.keras Rescaling is baked inside model.py architecture,
    # so we supply standard raw float image arrays [0.0 - 255.0]
    img_ndarray = np.expand_dims(img_resized, axis=0) # Add batch dimension: shape (1, H, W, 3)
    
    return img_ndarray, img_bgr

def run_prediction(model_path, image_path):
    print(f"📖 Loading trained Deep Learning Model: {model_path}...")
    if not os.path.exists(model_path):
        print(f"❌ Model could not be found at {model_path}. Complete training first!")
        return
        
    model = tf.keras.models.load_model(model_path)
    
    try:
        input_data, raw_image = preprocess_gis_image(image_path)
        
        # Predict logits
        predictions = model.predict(input_data)[0]
        best_class_idx = np.argmax(predictions)
        confidence = predictions[best_class_idx]
        road_type = CLASSES[best_class_idx]
        
        print("\\n==================================")
        print("📊 MODEL CLASSIFICATION OUTCOMES:")
        for idxIn, prob in enumerate(predictions):
            print(f"- {CLASSES[idxIn]}: {prob * 100:.2f}%")
        print("==================================")
        print(f"🏆 Final Classification: {road_type} ({confidence * 100:.1f}%)")
        
        # Superimpose results text on screen canvas using OpenCV
        overlay_text = f"Classified: {road_type} ({confidence * 100:.0f}%)"
        output_display = raw_image.copy()
        
        # Style layout annotations
        cv2.putText(
            output_display, 
            overlay_text, 
            (25, 45), 
            cv2.FONT_HERSHEY_SIMPLEX, 
            1.0, 
            (0, 255, 0), # Bright Lime Green
            2, 
            cv2.LINE_AA
        )
        
        # Save output result
        output_preview_path = "classified_output.png"
        cv2.imwrite(output_preview_path, output_display)
        print(f"💾 Annotated overlay preview stored successfully at: {output_preview_path}")
        
    except Exception as e:
        print(f"⚠️ Exception during prediction workflow: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("💡 Usage: python inference.py <model_path.keras> <road_image.png>")
    else:
        run_prediction(sys.argv[1], sys.argv[2])
`;

  // Beginner-friendly preprocessing script requested by the user
  const preprocessBeginnerCode = `"""
preprocess_beginner.py - Easy-to-follow GIS Road Image preprocessing pipeline.
Fulfills all requirements: Loading, Resizing (128x128), Pixel Normalization, 
Categorical labeling, Train/Test split loading, and Matplotlib sample rendering.
"""

import os
import cv2
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt
from tensorflow.keras.utils import to_categorical

# Config Constants
IMAGE_SIZE = (${size}, ${size})  # Set dynamically to ${size}x${size}
CLASSES = ["highway", "street", "village_road", "dirt_road", "concrete_road"]
DATASET_DIR = "dataset" # Root directory containing "train" and "test" folders

def load_and_preprocess_split(split_name):
    """
    Scans the selected split ('train' or 'test') sub-directories,
    reads images via OpenCV, resizes to ${size}x${size}, and normalizes pixels.
    """
    images = []
    labels = []
    
    split_path = os.path.join(DATASET_DIR, split_name)
    if not os.path.exists(split_path):
        print(f"⚠️ Warning: Split path not found: {split_path}")
        return np.array([]), np.array([])
        
    print(f"📖 Ingesting GIS images from split: '{split_name}'...")
    for class_idx, class_name in enumerate(CLASSES):
        class_folder = os.path.join(split_path, class_name)
        if not os.path.exists(class_folder):
            print(f"  └─ Folder not found: {class_folder}, skipping.")
            continue
            
        file_list = [f for f in os.listdir(class_folder) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        print(f"  └─ Class '{class_name}': Found {len(file_list)} files.")
        
        for file_name in file_list:
            img_path = os.path.join(class_folder, file_name)
            try:
                # 1. Load image using OpenCV (loads as standard BGR)
                img = cv2.imread(img_path)
                if img is None:
                    continue
                
                # Convert from OpenCV BGR color profile back to standard RGB
                img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                
                # 2. Resize image to target shape (${size}x${size})
                img_resized = cv2.resize(img_rgb, IMAGE_SIZE)
                
                # Add to memory arrays
                images.append(img_resized)
                labels.append(class_idx)
            except Exception as e:
                print(f"❌ Error loading {file_name}: {e}")
                
    # Convert lists to NumPy arrays
    images_arr = np.array(images, dtype="float32")
    labels_arr = np.array(labels, dtype="int32")
    
    if len(images_arr) == 0:
         return images_arr, labels_arr
         
    # 3. Normalize pixel intensities to the standard [0, 1] range
    images_norm = images_arr / 255.0
    
    # 4. Convert numerical labels into One-Hot categorical vectors (e.g., class 2 -> [0, 0, 1, 0, 0])
    labels_categorical = to_categorical(labels_arr, num_classes=len(CLASSES))
    
    print(f"✅ Loaded split '{split_name}': {images_norm.shape[0]} images, shape: {images_norm.shape}")
    return images_norm, labels_categorical

def display_samples(images, labels_onehot, count=5):
    """
    Plots sample images from the loaded dataset split using Matplotlib
    displaying class names.
    """
    if len(images) == 0:
        print("⚠️ No images verified. Skipping sample preview visualization.")
        return
        
    display_count = min(count, len(images))
    plt.figure(figsize=(12, 3))
    
    for i in range(display_count):
        plt.subplot(1, display_count, i + 1)
        plt.imshow(images[i])
        
        # Get true class text from one-hot vector index
        class_idx = np.argmax(labels_onehot[i])
        class_label = CLASSES[class_idx]
        
        plt.title(f"Class: {class_label}", fontsize=10)
        plt.axis("off")
        
    plt.tight_layout()
    plt.show()

# Main workflow execution block
if __name__ == "__main__":
    print("🚀 Running Beginner-Friendly Preprocessing Workflow...")
    
    # 5. Load and process training and testing directories separately
    X_train, y_train = load_and_preprocess_split("train")
    X_test, y_test = load_and_preprocess_split("test")
    
    # Report final dataset shapes
    if len(X_train) > 0:
        print("\\n================ DATASET REPORT ================")
        print(f"Training Features Shape: {X_train.shape} (Count, Height, Width, Channels)")
        print(f"Training Targets Shape:  {y_train.shape} (Count, One-Hot Labels)")
        if len(X_test) > 0:
            print(f"Testing Features Shape:  {X_test.shape}")
            print(f"Testing Targets Shape:   {y_test.shape}")
        print("================================================")
        
        # 6. Display sample images
        print("🎨 Displaying random samples from the training set split...")
        display_samples(X_train, y_train, count=5)
    else:
        print("\\n⚠️ Preprocessing Demo Active. Please create your folder layout first:")
        print("  dataset/")
        print("  ├── train/")
        print("  │   ├── highway/")
        print("  │   ├── street/")
        print("  │   ├── village_road/")
        print("  │   ├── dirt_road/")
        print("  │   └── concrete_road/")
        print("  └── test/")
        print("      ├── highway/")
        print("      └── ...")
`;

  // Standalone complete model builder with TensorFlow/Keras
  const cnnModelCompleteCode = `"""
standalone_cnn_model.py - Complete CNN Deep Learning model for Road Type Classification.
Built with TensorFlow and Keras.

Fulfills all requirements:
1. Input shape = 128x128x3 (RGB channels)
2. Multiple Conv2D layers
3. MaxPooling layers
4. Flatten layer
5. Dense classification layers
6. Softmax output layer
7. Compiled using Adam optimizer (learning rate: ${lr})
8. Categorical cross-entropy loss function
9. Displays and logs comprehensive model summary
"""

import tensorflow as tf
from tensorflow.keras import layers, models

# 5 Target Classes: Highway, Street, Village, Dirt, Concrete
CLASSES = ["Highway", "Street", "Village", "Dirt", "Concrete"]
NUM_CLASSES = len(CLASSES)
INPUT_SHAPE = (${size}, ${size}, 3) # Configured dynamically for ${size}x${size}x3 inputs

def create_road_cnn_model(input_shape=INPUT_SHAPE, num_classes=NUM_CLASSES):
    """
    Creates a Sequential Convolutional Neural Network (CNN)
    specifically compiled for satellite and aerial GIS Road Type Classification.
    """
    model = models.Sequential([
        # 1. Specifying the inputs (128x128, RGB channels)
        layers.Input(shape=input_shape),
        
        # In-Model Normalization: automatically scales pixel coordinates from [0, 255] to [0, 1]
        layers.Rescaling(1./255),
        
        # 2. First Conv2D and MaxPooling blocks
        # Conv2D detects local edge gradients, foliage masks and street curbs.
        layers.Conv2D(32, (3, 3), activation="relu", padding="same"),
        layers.MaxPooling2D(pool_size=(2, 2)), # Output shape: (${size / 2}, ${size / 2}, 32)
        
        # Second Conv2D and MaxPooling blocks
        layers.Conv2D(64, (3, 3), activation="relu", padding="same"),
        layers.MaxPooling2D(pool_size=(2, 2)), # Output shape: (${size / 4}, ${size / 4}, 64)
        
        # Third Conv2D and MaxPooling blocks
        # Captures broader road grid geometries & structural transitions
        layers.Conv2D(128, (3, 3), activation="relu", padding="same"),
        layers.MaxPooling2D(pool_size=(2, 2)), # Output shape: (${size / 8}, ${size / 8}, 128)
        
        # Fourth Conv2D and MaxPooling blocks
        # Multi-layer deep mapping captures fine-grained concrete textures vs rural clay
        layers.Conv2D(128, (3, 3), activation="relu", padding="same"),
        layers.MaxPooling2D(pool_size=(2, 2)), # Output shape: (${size / 16}, ${size / 16}, 128)
        
        # 4. Flatten Layer: Flattens multi-dimensional maps into single vectors
        layers.Flatten(),
        
        # 5. Dense layers for multi-class representation logic
        layers.Dense(128, activation="relu"),
        layers.Dropout(${dropout}), # Configured dropout rate of ${dropout} to prevent model overfit
        
        layers.Dense(64, activation="relu"),
        layers.Dropout(0.2), # Secondary regularization
        
        # 6. Softmax Output Layer: Outputs the probability score across the 5 categories
        layers.Dense(num_classes, activation="softmax")
    ])
    
    return model

if __name__ == "__main__":
    print("🏗️ Creating Standalone Core Road CNN Architecture...")
    # Instantiate the Keras model
    model = create_road_cnn_model()
    
    # 7. Compile model using Adam Optimizer
    # 8. Use standard categorical crossentropy for multi-class inputs
    print("⚙️ Compiling model with Adam (lr=${lr}) and Categorical Cross-Entropy...")
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=${lr}),
        loss="categorical_crossentropy",
        metrics=["accuracy"]
    )
    
    # 9. Display Model Summary details
    print("\\n======================= MODEL SUMMARY =======================")
    model.summary()
    print("=============================================================")
    print("\\nModel is successfully compiled and ready to train on 5 classes:")
    for idx, name in enumerate(CLASSES):
        print(f" - Class {idx}: {name}")
`;

  // Standalone beginner training script
  const trainBeginnerCode = `"""
train_beginner.py - Complete beginner-friendly code to train the CNN model.
Fulfills all requirements:
1. Trains the model using model.fit()
2. Uses 10-20 epochs (configured dynamically to ${epochs} epochs)
3. Displays training accuracy and loss metrics in the console
4. Saves the trained model as 'road_classifier.h5'
5. Plots accuracy and loss graphs using Matplotlib
"""

import matplotlib.pyplot as plt
from preprocess_beginner import load_and_preprocess_split
from standalone_cnn_model import create_road_cnn_model
import tensorflow as tf

# Config Constants
EPOCHS = ${epochs}  # Set dynamically to ${epochs}; recommended range for beginner datasets is 10-20 epochs
BATCH_SIZE = ${batch}
LEARNING_RATE = ${lr}

def main():
    print("🚀 Loading preprocessed train and validation datasets...")
    # 1. Load preprocessed splits (resized to ${size}x${size}, normalized [0, 1])
    X_train, y_train = load_and_preprocess_split("train")
    X_test, y_test = load_and_preprocess_split("test")
    
    if len(X_train) == 0:
        print("❌ Error: No training data found!")
        print("Please make sure your 'dataset/train/' folders exist and have images.")
        return

    # 2. Build and compile the CNN Model
    print("🏗️ Instantiating the CNN model layout...")
    model = create_road_cnn_model()
    
    print(f"⚙️ Compiling model with Adam optimizer (learning rate: {LEARNING_RATE})...")
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=LEARNING_RATE),
        loss="categorical_crossentropy",
        metrics=["accuracy"]
    )
    
    # 3. Train model using model.fit()
    print(f"🔥 Training the CNN model for {EPOCHS} epochs with batch size {BATCH_SIZE}...")
    validation_data = (X_test, y_test) if len(X_test) > 0 else None
    
    history = model.fit(
        X_train, 
        y_train,
        epochs=EPOCHS,
        batch_size=BATCH_SIZE,
        validation_data=validation_data,
        verbose=1
    )
    
    # 4. Save trained model as road_classifier.h5 (Keras standard H5 file)
    save_filename = "road_classifier.h5"
    print(f"💾 Saving trained weights as H5 file format to: '{save_filename}'...")
    model.save(save_filename)
    print(f"✅ Saved trained model file successfully!")
    
    # Report performance metrics to console
    train_loss = history.history['loss'][-1]
    train_acc = history.history['accuracy'][-1]
    print("\\n================ PERFORMANCE REPORT ================")
    print(f"Final training loss:     {train_loss:.4f}")
    print(f"Final training accuracy: {train_acc * 100:.2f}%")
    if validation_data:
        v_loss = history.history['val_loss'][-1]
        v_acc = history.history['val_accuracy'][-1]
        print(f"Final validation loss:   {v_loss:.4f}")
        print(f"Final validation accuracy: {v_acc * 100:.2f}%")
    print("====================================================")
        
    # 5. Plot accuracy and loss graphs using matplotlib
    plot_metrics(history)

def plot_metrics(history):
    print("📈 Plotting and saving optimization history graphs...")
    acc = history.history['accuracy']
    loss = history.history['loss']
    epochs_range = range(1, len(acc) + 1)
    
    plt.figure(figsize=(12, 5))
    
    # Plot accuracy charts
    plt.subplot(1, 2, 1)
    plt.plot(epochs_range, acc, label='Training Accuracy', color='teal', marker='o')
    if 'val_accuracy' in history.history:
        plt.plot(epochs_range, history.history['val_accuracy'], label='Validation Accuracy', color='orange', marker='x')
    plt.title('Training & Validation Accuracy')
    plt.xlabel('Epochs')
    plt.ylabel('Accuracy')
    plt.legend(loc='lower right')
    plt.grid(True, linestyle='--')
    
    # Plot loss charts
    plt.subplot(1, 2, 2)
    plt.plot(epochs_range, loss, label='Training Loss', color='crimson', marker='o')
    if 'val_loss' in history.history:
        plt.plot(epochs_range, history.history['val_loss'], label='Validation Loss', color='darkblue', marker='x')
    plt.title('Training & Validation Loss')
    plt.xlabel('Epochs')
    plt.ylabel('Loss (Categorical Crossentropy)')
    plt.legend(loc='upper right')
    plt.grid(True, linestyle='--')
    
    plt.tight_layout()
    plt.savefig("road_training_curves.png")
    print("💾 Loss and accuracy graph successfully saved as 'road_training_curves.png'")
    plt.show()

if __name__ == "__main__":
    main()
`;

  // Standalone beginner inference script with OpenCV and TensorFlow
  const testBeginnerCode = `"""
test_beginner.py - Inference test script for GIS Road Type Classification.
Loads a trained Keras model, processes an input image, and visualizes the prediction.
Includes pre-trained MobileNetV2 category screening to filter out-of-domain images like pets/dogs/cats.

Fulfills all requirements:
1. Loads the trained model ('road_classifier.h5')
2. Loads a new target GIS/satellite test image with OpenCV
3. Resizes the image to the model's required \${size}x\${size} dimensions
4. Predicts the road type category
5. Rejects non-road inputs below the best confidence threshold (75%)
6. Shows the image with the predicted label if valid, or a warning
"""

import sys
import os
import cv2
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt

# Config Constants
IMAGE_SIZE = (\${size}, \${size})  # Set dynamically to match training size (\${size}x\${size})
CLASSES = ["Highway", "Street", "Village", "Dirt", "Concrete"]
CONF_THRESHOLD = 0.75  # Best confidence threshold (75%) to minimize false predictions

def is_valid_gis_domain(image_path):
    """
    Utility using pre-trained MobileNetV2 to scan for out-of-domain animals and objects (dogs, cats, household items).
    """
    print("🛡️ Bootstrapping pre-trained domain screening (MobileNetV2)...")
    try:
        validator = tf.keras.applications.MobileNetV2(weights="imagenet")
    except Exception as e:
        print(f"⚠️ Offline/loading check warning for image-net scanner: {e}")
        return True, "Check skipped"
        
    # Read and resize specifically for MobileNet standard shape (224, 224, 3)
    img = cv2.imread(image_path)
    if img is None:
        return False, "Could not open file"
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img_resized = cv2.resize(img_rgb, (224, 224))
    img_expand = np.expand_dims(img_resized, axis=0)
    img_preprocessed = tf.keras.applications.mobilenet_v2.preprocess_input(img_expand)
    
    # Analyze ImageNet categories
    preds = validator.predict(img_preprocessed, verbose=0)
    decoded = tf.keras.applications.mobilenet_v2.decode_predictions(preds, top=5)[0]
    
    # List of common domestic and non-terrain elements to block
    blacklist = [
        "dog", "cat", "puppy", "poodle", "pomeranian", "retriever", "terrier", "spaniel", 
        "persian", "kitten", "toy", "teddy", "sofa", "couch", "bed", "table", "chair", "furniture",
        "human", "person", "man", "woman", "baby", "child", "face", "glove", "boot", "shoe",
        "cup", "fork", "plate", "kitchen", "refrigerator", "tv", "monitor", "laptop", "mouse",
        "food", "sandwich", "fruit", "animal", "domestic", "wardrobe", "feline", "canine"
    ]
    
    for _, label, prob in decoded:
        label_lower = label.lower()
        if prob > 0.15: # Significant matching presence
            for keyword in blacklist:
                if keyword in label_lower:
                    readable_label = label.replace("_", " ").title()
                    return False, f"Flagged out-of-domain entity: {readable_label} ({prob*100:.1f}%)"
                    
    return True, "Matches outdoor GIS/satellite scene structures."

def run_road_type_inference(image_path, model_path="road_classifier.h5"):
    # 1. First run general domain validation
    is_valid, reason = is_valid_gis_domain(image_path)
    if not is_valid:
        print("\\n🚫 ================= INVALID IMAGE DETECTED =================")
        print("Invalid Image. Please upload a proper road or GIS image.")
        print(f"Details: {reason}")
        print("=============================================================\\n")
        return
        
    # 2. Load trained model
    if not os.path.exists(model_path):
        print(f"❌ Error: Model file not found at '{model_path}'")
        print("Please train the model first to generate the file.")
        return
        
    print(f"📖 Loading trained road classification model: '{model_path}'...")
    try:
        model = tf.keras.models.load_model(model_path)
        print("✅ Model loaded successfully!")
    except Exception as e:
        print(f"❌ Failed to load model weights: {e}")
        return
    
    # Load test image using OpenCV
    print(f"📷 Reading test GIS/Satellite image: '{image_path}'...")
    img = cv2.imread(image_path)
    if img is None:
        print(f"❌ Error: Could not read image at '{image_path}'.")
        return
        
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # 3. Resize image to model resolution
    print(f"📏 Resizing image from {img.shape[1]}x{img.shape[0]} to target {IMAGE_SIZE[0]}x{IMAGE_SIZE[1]}...")
    img_resized = cv2.resize(img_rgb, IMAGE_SIZE)
    img_normalized = img_resized.astype("float32") / 255.0
    input_tensor = np.expand_dims(img_normalized, axis=0)
    
    # 4. Predict road type
    print("🔮 Processing image feed through the custom network...")
    predictions = model.predict(input_tensor, verbose=0)
    predicted_class_idx = np.argmax(predictions[0])
    predicted_label = CLASSES[predicted_class_idx]
    confidence_decimal = predictions[0][predicted_class_idx]
    confidence = confidence_decimal * 100
    
    # 5. Domain Rejection based on Confidence Threshold
    if confidence_decimal < CONF_THRESHOLD:
        print("\\n🚫 ================= REJECTION BY CONFIDENCE ================= ")
        print("Invalid Image. Please upload a proper road or GIS image.")
        print(f"Details: Classification confidence too low ({confidence:.2f}% < {CONF_THRESHOLD*100:.1f}%)")
        print("Images containing stray domestic elements or pets are filtered for classification safety.")
        print("=============================================================\\n")
        return
        
    print("\\n================ PREDICTION REPORT ================")
    print(f" Target File:      {os.path.basename(image_path)}")
    print(f" Predicted Class:  {predicted_label}")
    print(f" Confidence Score: {confidence:.2f}%")
    print("---------------------------------------------------")
    print(" Probability Distribution:")
    for idx, name in enumerate(CLASSES):
        pct = predictions[0][idx] * 100
        print(f"  └─ {name:<10}: {pct:>6.2f}%")
    print("===================================================\\n")
    
    # 6. Show image with predicted label decoration using Matplotlib
    print("🎨 Rendering display visualization...")
    plt.figure(figsize=(7, 7))
    plt.imshow(img_rgb)
    
    title_str = f"Prediction: {predicted_label} ({confidence:.2f}%)"
    plt.title(title_str, fontsize=14, color="darkgreen", fontweight="bold", pad=12)
    plt.axis("off")
    
    output_image_path = "prediction_result.png"
    plt.savefig(output_image_path, bbox_inches="tight")
    print(f"💾 Visual annotated report stored to: '{output_image_path}'")
    plt.show()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        target_image = sys.argv[1]
    else:
        target_image = "test_road_sample.jpg"
        print(f"ℹ️ No image passed via command line. Running fallback demo: '{target_image}'")
        
    run_road_type_inference(target_image)
`;

  // Academic Presentation-Grade Plotting Tool (Seaborn-like elegance, high DPI, customizable)
  const presentationPlotCode = `"""
plot_presentation_curves.py - Presentation-Grade CNN Performance Visualizer.
Designed for Final Year Project (FYP) presentations, academic reports, and slide decks.

Features:
- Dual-pane layout (Accuracy on the left, Loss on the right)
- High-definition rendering (High DPI = 300 for premium slide clarity)
- Customizable color palette (Classic Royal Blue/Coral, Teal/Crimson, etc.)
- Clear marker dots on points, styled grids, and shaded validation zones
- Auto-telemetry builder: generates a high-quality mockup if the database history is absent
"""

import os
import matplotlib.pyplot as plt
import numpy as np

def generate_presentation_plots(history_data=None, output_path="fyp_road_training_curves.png", dpi=300):
    """
    Plots training validation curves with professional-grade style settings.
    """
    print(f"🎨 Generating final-year project styled diagrams (High-DPI = {dpi})...")
    
    # 1. Check/Mock training data history
    if history_data is None:
        print("ℹ️ No active model history passed. Bootstrapping realistic GIS Road CNN mock telemetry...")
        # Simulating typical model optimization path for 20 epochs
        epochs_range = list(range(1, 21))
        
        # High-quality realistic accuracy decay & improvement metrics
        train_acc = [0.42, 0.55, 0.63, 0.71, 0.76, 0.81, 0.84, 0.86, 0.89, 0.90, 
                     0.92, 0.93, 0.95, 0.96, 0.96, 0.97, 0.98, 0.98, 0.99, 0.99]
        val_acc   = [0.40, 0.51, 0.60, 0.68, 0.71, 0.77, 0.80, 0.82, 0.84, 0.85, 
                     0.87, 0.88, 0.89, 0.88, 0.90, 0.89, 0.91, 0.90, 0.91, 0.92]
                     
        # High quality categorical cross-entropy loss decay metrics
        train_loss = [1.55, 1.25, 1.05, 0.88, 0.74, 0.62, 0.53, 0.45, 0.38, 0.33, 
                      0.28, 0.24, 0.20, 0.17, 0.14, 0.12, 0.10, 0.08, 0.07, 0.05]
        val_loss   = [1.60, 1.30, 1.12, 0.95, 0.85, 0.74, 0.66, 0.59, 0.53, 0.49, 
                      0.44, 0.41, 0.38, 0.40, 0.36, 0.39, 0.35, 0.38, 0.36, 0.34]
    else:
        epochs_range = list(range(1, len(history_data.get('accuracy', [])) + 1))
        train_acc = history_data.get('accuracy', [])
        val_acc = history_data.get('val_accuracy', [])
        train_loss = history_data.get('loss', [])
        val_loss = history_data.get('val_loss', [])
        
    num_epochs = len(epochs_range)
    
    # 2. Universal Presentation-Grade Matplotlib Style Injection
    # Setup premium layout configuration
    plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
    
    # Configure font parameter dictionaries
    title_font = {'family': 'sans-serif', 'weight': 'bold', 'size': 14, 'color': '#2C3E50'}
    axis_font  = {'family': 'sans-serif', 'weight': 'normal', 'size': 11, 'color': '#34495E'}
    
    # Create master container canvas with wide aspect ratio
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
    
    # Accent color codes
    COLOR_TRAIN_ACC = '#1E3A8A'  # Deep Navy Blue
    COLOR_VAL_ACC   = '#F59E0B'  # Amber yellow
    COLOR_TRAIN_LOSS = '#B91C1C' # Crimson Red
    COLOR_VAL_LOSS   = '#10B981' # Emerald Green
    
    # ================= PANEL 1: ACCURACY METRICS =================
    # Plot accuracy lines with circles and small semi-transparent markers
    ax1.plot(epochs_range, train_acc, label='Training Accuracy', color=COLOR_TRAIN_ACC, 
             linewidth=2.5, marker='o', markersize=6, alpha=0.95)
    ax1.plot(epochs_range, val_acc, label='Validation Accuracy', color=COLOR_VAL_ACC, 
             linewidth=2.2, marker='s', markersize=5, alpha=0.95)
             
    # Shade validation uncertainty bounds area for academic appeal
    ax1.fill_between(epochs_range, train_acc, val_acc, color='#3B82F6', alpha=0.08, label='Performance Margin')
    
    # Labels, grid, limits, and legend
    ax1.set_title('GIS Model Classification Accuracy Curves', pad=15, fontdict=title_font)
    ax1.set_xlabel('Epochs (Training Progression)', labelpad=10, fontdict=axis_font)
    ax1.set_ylabel('Accuracy Score (0.00 to 1.00)', labelpad=10, fontdict=axis_font)
    ax1.set_ylim(0.0, 1.05)
    ax1.set_xticks(np.arange(1, num_epochs + 1, max(1, num_epochs // 10)))
    ax1.legend(loc='lower right', frameon=True, facecolor='white', edgecolor='#BDC3C7', fontsize=10)
    ax1.grid(True, linestyle='--', color='#BDC3C7', alpha=0.5)
    ax1.tick_params(colors='#2C3E50', labelsize=10)
    
    # Annotated optimal peak performance index flag
    best_val_epoch = np.argmax(val_acc) + 1
    best_val_score = val_acc[best_val_epoch - 1]
    ax1.annotate(f'Peak Val: {best_val_score * 100:.1f}%\\n(Epoch {best_val_epoch})',
                 xy=(best_val_epoch, best_val_score),
                 xytext=(best_val_epoch - 4 if best_val_epoch > 6 else best_val_epoch + 1, best_val_score - 0.15),
                 arrowprops=dict(facecolor='#1E293B', shrink=0.08, width=1, headwidth=6, headlength=6),
                 fontsize=9, color='#1E293B', weight='bold', bbox=dict(boxstyle='round,pad=0.3', facecolor='#F8FAFC', edgecolor='#E2E8F0'))

    # ================= PANEL 2: LOSS METRICS =================
    ax2.plot(epochs_range, train_loss, label='Training Loss', color=COLOR_TRAIN_LOSS, 
             linewidth=2.5, marker='o', markersize=6, alpha=0.95)
    ax2.plot(epochs_range, val_loss, label='Validation Loss', color=COLOR_VAL_LOSS, 
             linewidth=2.2, marker='^', markersize=5, alpha=0.95)
             
    # Shading the loss divergence danger sector
    ax2.fill_between(epochs_range, train_loss, val_loss, color='#EF4444', alpha=0.05, label='Loss Divergence')
    
    ax2.set_title('Cross-Entropy Optimization Loss Curves', pad=15, fontdict=title_font)
    ax2.set_xlabel('Epochs (Training Progression)', labelpad=10, fontdict=axis_font)
    ax2.set_ylabel('Loss Value (Categorical Cross-Entropy)', labelpad=10, fontdict=axis_font)
    ax2.set_ylim(0.0, max(max(train_loss), max(val_loss)) * 1.1 if num_epochs > 0 else 2.0)
    ax2.set_xticks(np.arange(1, num_epochs + 1, max(1, num_epochs // 10)))
    ax2.legend(loc='upper right', frameon=True, facecolor='white', edgecolor='#BDC3C7', fontsize=10)
    ax2.grid(True, linestyle='--', color='#BDC3C7', alpha=0.5)
    ax2.tick_params(colors='#2C3E50', labelsize=10)
    
    # Annotated minimum convergence loss point flag
    min_val_epoch = np.argmin(val_loss) + 1
    min_val_score = val_loss[min_val_epoch - 1]
    ax2.annotate(f'Min Loss: {min_val_score:.4f}\\n(Epoch {min_val_epoch})',
                 xy=(min_val_epoch, min_val_score),
                 xytext=(min_val_epoch - 4 if min_val_epoch > 6 else min_val_epoch + 1, min_val_score + 0.25),
                 arrowprops=dict(facecolor='#1E293B', shrink=0.08, width=1, headwidth=6, headlength=6),
                 fontsize=9, color='#1E293B', weight='bold', bbox=dict(boxstyle='round,pad=0.3', facecolor='#F8FAFC', edgecolor='#E2E8F0'))

    # Subtitle decoration styling
    plt.suptitle("Deep CNN Road Type Classification Performance Telemetry Model Diagnostics", 
                 fontsize=15, weight='bold', color='#1E293B', y=0.98)
    
    plt.tight_layout(rect=[0, 0, 1, 0.94])
    
    # Save as ultra high resolution image suitable for PowerPoint slides and PDF thesis documents
    plt.savefig(output_path, dpi=dpi, bbox_inches='tight')
    print(f"✅ Success! Presentation-grade chart exported to: '{output_path}'")
    plt.show()

if __name__ == "__main__":
    generate_presentation_plots()
`;

  // Standard Streamlit web application template
  const streamlitAppCode = `"""
app.py - Streamlit Web Application interface for Road Type Classification.
Loads 'road_classifier.h5' and provides a drop-and-drag web interface to verify models.
Includes advanced pre-trained CNN (MobileNetV2) guardrails to reject out-of-domain/non-road images.

Requirements:
1. Upload GIS image (PIL & Streamlit file_uploader)
2. Predict road type (TensorFlow target inference)
3. Display prediction confidence scores with clean visuals
4. Show uploaded source image
5. Minimal and clean UI design layout
6. Robust loading checks for trained weights
"""

import os
import cv2
import numpy as np
import tensorflow as tf
import streamlit as st
from PIL import Image

# 1. Config Web Browser View Contexts
st.set_page_config(
    page_title="GIS Road Analytics System",
    page_icon="🛣️",
    layout="centered",
    initial_sidebar_state="expanded"
)

# Setup Target Road Classes
CLASSES = ["Highway", "Street", "Village", "Dirt", "Concrete"]
IMAGE_SIZE = (\${size}, \${size})
MODEL_PATH = "road_classifier.h5"

# Custom Streamlit layout styles
st.markdown("""
    <style>
    .main-header {
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 700;
        color: #1E293B;
    }
    .metric-card {
        background-color: #F8FAFC;
        padding: 15px;
        border-radius: 10px;
        border: 1px solid #E2E8F0;
    }
    .error-card {
        background-color: #FEF2F2;
        padding: 15px;
        border-radius: 10px;
        border: 1px solid #FEE2E2;
        color: #991B1B;
        font-weight: bold;
    }
    </style>
""", unsafe_allow_html=True)

# 2. Lazy Model Loading with Cache decorator
@st.cache_resource()
def load_cnn_classifier(filepath):
    if not os.path.exists(filepath):
        return None
    try:
        compiled_model = tf.keras.models.load_model(filepath)
        return compiled_model
    except Exception as e:
        st.error(f"⚠️ Error opening Keras file: {e}")
        return None

@st.cache_resource()
def load_mobilenet_validator():
    """
    Loads pre-trained MobileNetV2 from Keras applications for universal image screening.
    """
    try:
        model = tf.keras.applications.MobileNetV2(weights="imagenet")
        return model
    except Exception as e:
        st.warning(f"⚠️ Could not build MobileNetV2 (ImageNet) offline validation layer: {e}")
        return None

# Load Models
model = load_cnn_classifier(MODEL_PATH)
mobilenet_model = load_mobilenet_validator()

# Main Title & Subtitles
st.title("🛣️ GIS Road Type Classification App")
st.write("An interactive web interface to load deep-learning weights and analyze road infrastructure files.")

st.sidebar.header("⚙️ Configuration Settings")
st.sidebar.info(f"⚙️ Target Ingest Dimension: {IMAGE_SIZE[0]}x{IMAGE_SIZE[1]} pixels (RGB Channels)")

# Threshold Configurations
st.sidebar.markdown("### 🛡️ Domain Validation Guardrails")
enable_guardrail = st.sidebar.checkbox("Enable Image Domain Guard (MobileNetV2)", value=True, help="Scans the image for animals, household items, or people and alerts the user.")
min_confidence_thresh = st.sidebar.slider("Confidence Rejection Threshold (%)", min_value=10, max_value=100, value=75, step=5, help="Rejects prediction if highest class confidence is below this value.") / 100.0

if model is None:
    st.sidebar.warning("⚠️ 'road_classifier.h5' model file is missing. Running in interactive Demo mode using simulation rules.")
    st.sidebar.markdown("Generate your trained model by running:")
    st.sidebar.code("python train_beginner.py", language="bash")
else:
    st.sidebar.success("✅ 'road_classifier.h5' core weights loaded successfully.")

# File Uploader Section
st.write("### 📤 Upload GIS Target Image")
uploaded_file = st.file_uploader(
    "Drag and drop any satellite or aerial image of a road to start classification",
    type=["jpg", "jpeg", "png", "tiff", "bmp"]
)

# Out-of-Domain Detection Logic
def passes_domain_screening(img_pil, threshold_score=0.15):
    """
    Returns True if the image does NOT contain household pets, human elements, or domestic goods.
    """
    if mobilenet_model is None:
        return True, "Validation skipped (Model not instantiated)"
        
    # Resize to MobileNetV2 requirement: 224x224
    img_resized = img_pil.resize((224, 224))
    img_arr = np.array(img_resized.convert("RGB"))
    img_expand = np.expand_dims(img_arr, axis=0)
    img_preprocessed = tf.keras.applications.mobilenet_v2.preprocess_input(img_expand)
    
    predictions = mobilenet_model.predict(img_preprocessed, verbose=0)
    decoded = tf.keras.applications.mobilenet_v2.decode_predictions(predictions, top=5)[0]
    
    # Non-road domestic categories
    blacklist_keywords = [
        "dog", "cat", "puppy", "poodle", "pomeranian", "retriever", "terrier", "spaniel", 
        "persian", "kitten", "toy", "teddy", "sofa", "couch", "bed", "table", "chair", "furniture",
        "human", "person", "man", "woman", "baby", "child", "face", "glove", "boot", "shoe",
        "cup", "fork", "plate", "kitchen", "refrigerator", "tv", "monitor", "laptop", "mouse",
        "food", "sandwich", "fruit", "animal", "domestic", "wardrobe", "feline", "canine"
    ]
    
    for imagenet_id, label, prob in decoded:
        label_lower = label.lower()
        if prob > threshold_score:
            for keyword in blacklist_keywords:
                if keyword in label_lower:
                    readable = label.replace("_", " ").title()
                    return False, f"Detected out-of-domain domestic item or pet: {readable} ({prob*100:.1f}% confidence)"
                    
    return True, "Image matches general outdoor terrain domain criteria."

if uploaded_file is not None:
    st.write("---")
    
    try:
        image = Image.open(uploaded_file)
        
        # Filter Non-Road Image upload before processing any custom road predictions
        is_valid_domain = True
        domain_message = ""
        
        if enable_guardrail:
            with st.spinner("Analyzing image domains..."):
                is_valid_domain, domain_message = passes_domain_screening(image)
                
        if not is_valid_domain:
            st.markdown(f'<div class="error-card">⚠️ Invalid Image. Please upload a proper road or GIS image.<br><small>Details: {domain_message}</small></div>', unsafe_allow_html=True)
            st.image(image, use_container_width=True, caption="Uploaded Input (REJECTED)")
        else:
            col_img, col_pred = st.columns([1, 1], gap="large")
            
            with col_img:
                st.subheader("📷 Ingress Target File")
                st.image(image, use_container_width=True, caption=uploaded_file.name)
                    
            with col_pred:
                st.subheader("🔮 Predictive Intelligence Analytics")
                
                # Predict Road Type
                if model is not None:
                    with st.spinner("Processing deep network inference..."):
                        # Convert to RGB numpy array
                        img_np = np.array(image.convert("RGB"))
                        
                        # Resize standard image
                        img_resized = cv2.resize(img_np, IMAGE_SIZE)
                        img_normalized = img_resized.astype("float32") / 255.0
                        batch_tensor = np.expand_dims(img_normalized, axis=0)
                        
                        # Feed predictions
                        preds = model.predict(batch_tensor, verbose=0)[0]
                        best_class_idx = np.argmax(preds)
                        label_name = CLASSES[best_class_idx]
                        prob_percentage = preds[best_class_idx] * 100
                        prob_decimal = preds[best_class_idx]
                        
                        # 3. Check Confidence Threshold
                        if prob_decimal < min_confidence_thresh:
                            st.markdown(f'<div class="error-card">⚠️ Invalid Image. Please upload a proper road or GIS image.<br><small>Details: Classification confidence too low ({prob_percentage:.2f}% < {min_confidence_thresh * 100:.1f}%). Image is likely an out-of-domain random asset.</small></div>', unsafe_allow_html=True)
                        else:
                            st.success(f"**Predicted Category:** {label_name}")
                            st.metric(label="Inference Confidence Score", value=f"{prob_percentage:.2f}%")
                            
                            st.write("**Probability Analysis Breakdown:**")
                            for i, cls_name in enumerate(CLASSES):
                                cls_score = float(preds[i])
                                st.write(f"{cls_name} ({cls_score * 100:.1f}%)")
                                st.progress(cls_score)
                else:
                    # Interactive Dummy Verification Mock Mode (Simulating local checks)
                    st.warning("⚠️ Demonstration Mock Model Active")
                    
                    # Simulated seed classification
                    mock_class_idx = hash(uploaded_file.name) % (len(CLASSES) + 1)
                    
                    # If index is out of bounds, simulate low confidence / out of domain mock rejection
                    if mock_class_idx == len(CLASSES) or "dog" in uploaded_file.name.lower() or "cat" in uploaded_file.name.lower() or "poodle" in uploaded_file.name.lower():
                        st.markdown('<div class="error-card">⚠️ Invalid Image. Please upload a proper road or GIS image.<br><small>Details: Mock domain filter flagged this image file.</small></div>', unsafe_allow_html=True)
                    else:
                        sim_label = CLASSES[mock_class_idx]
                        sim_conf = 89.15
                        
                        st.success(f"**Mock Category:** {sim_label}")
                        st.metric(label="Confidence Level (Simulated)", value=f"{sim_conf:.2f}%")
                        
                        st.write("**Simulated Category Breakdown:**")
                        for i, cls_name in enumerate(CLASSES):
                            cls_score = 0.89 if i == mock_class_idx else (0.11 / (len(CLASSES)-1))
                            st.write(f"{cls_name} ({cls_score * 100:.1f}%)")
                            st.progress(cls_score)
                            
    except Exception as e:
        st.error(f"Image Pipeline Interrupted: {e}")

else:
    st.write("")
    st.info("💡 Upload one of your target road segments above to run the predictive analysis.")

st.markdown("---")
st.markdown("<p style='text-align: center; color: #64748B; font-size: 0.8em;'>Developed for GIS Analytics and Infrastructure Machine Learning FYP Projects</p>", unsafe_allow_html=True)
`;

  return [
    {
      title: "Dependency List",
      filename: "requirements.txt",
      language: "text",
      description: "Required lockfile list of python dependencies.",
      code: requirementsCode,
    },
    {
      title: "Beginner Preprocessing Script",
      filename: "preprocess_beginner.py",
      language: "python",
      description: "Complete visual beginner-friendly preprocessing code: Load images with OpenCV, resize to 128x128, normalize pixels, encode categories, and plot samples with Matplotlib.",
      code: preprocessBeginnerCode,
    },
    {
      title: "Beginner Standalone CNN Model",
      filename: "standalone_cnn_model.py",
      language: "python",
      description: "Complete visual beginner-friendly CNN definition, with multi-layer Conv2D, Pooling, Flatten, Dense, and compiled using Adam & Categorical Crossentropy.",
      code: cnnModelCompleteCode,
    },
    {
      title: "Beginner Training Script",
      filename: "train_beginner.py",
      language: "python",
      description: "Complete visual beginner-friendly training execution code: fit weights, log performance logs, store as road_classifier.h5, and render Matplotlib curves.",
      code: trainBeginnerCode,
    },
    {
      title: "Presentation Curves",
      filename: "plot_presentation_curves.py",
      language: "python",
      description: "Highly customized academic presentation visual graphics tool with dual validation subplots, high DPI settings, color mapping, peak coordinate bookmarks, and auto-generated fallbacks.",
      code: presentationPlotCode,
    },
    {
      title: "Beginner Testing Script",
      filename: "test_beginner.py",
      language: "python",
      description: "Complete visual beginner-friendly inference script with OpenCV image loading, model.predict(), confidence percentage calculations, and Matplotlib annotations.",
      code: testBeginnerCode,
    },
    {
      title: "Streamlit Web App",
      filename: "app.py",
      language: "python",
      description: "Interactive Streamlit web application dashboard to upload images, run predictive model checks, display confidence scores, and verify classifications.",
      code: streamlitAppCode,
    },
    {
      title: "Inflow dataset.py",
      filename: "dataset.py",
      language: "python",
      description: "High-efficiency dataset ingestion pipeline using OpenCV images.",
      code: datasetCode,
    },
    {
      title: "Neural Network Architecture",
      filename: "model.py",
      language: "python",
      description: "Custom deep learning layers and configurations.",
      code: modelCode,
    },
    {
      title: "Run Train.py Script",
      filename: "train.py",
      language: "python",
      description: "Model compiler and weights fitting cycles with graphics curves.",
      code: trainCode,
    },
    {
      title: "Predict/Test inference.py",
      filename: "inference.py",
      language: "python",
      description: "Inbound stream loads, predictions, and OpenCV superimposed annotation maps.",
      code: inferenceCode,
    },
  ];
}

