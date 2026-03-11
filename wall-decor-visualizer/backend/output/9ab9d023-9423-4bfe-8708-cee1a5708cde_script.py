OUTPUT_PATH = '/tmp/9ab9d023-9423-4bfe-8708-cee1a5708cde.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the structural skeleton of the wall based on the provided image dimensions.
    Dimensions used (in feet):
    - Total Width: 14.5' (7' opening + 7.5' solid wall)
    - Total Height: 9'
    - Opening: 7' wide, 8' high (located on the left)
    - Lintel (above opening): 7' wide, 1' high
    - Right Wall Section: 7.5' wide, 9' high
    """
    
    # Clear existing objects and start with a clean scene
    bpy.ops.wm.read_factory_settings(use_empty=True)
    
    # Define wall thickness (standard 0.5 feet)
    thickness = 0.5
    
    # 1. Create the Right Solid Wall Section
    # Dimensions: Width=7.5, Depth=0.5, Height=9
    # Placement: Starts at X=7. Center X = 7 + (7.5/2) = 10.75. Center Z = 9/2 = 4.5
    bpy.ops.mesh.primitive_cube_add(size=1, location=(10.75, thickness/2, 4.5))
    right_wall = bpy.context.active_object
    right_wall.scale = (7.5, thickness, 9)
    right_wall.name = "Wall_Section_Right"
    
    # 2. Create the Top Section (Lintel) above the doorway
    # Dimensions: Width=7, Depth=0.5, Height=1
    # Placement: Starts at X=0, Z=8. Center X = 7/2 = 3.5. Center Z = 8 + (1/2) = 8.5
    bpy.ops.mesh.primitive_cube_add(size=1, location=(3.5, thickness/2, 8.5))
    top_wall = bpy.context.active_object
    top_wall.scale = (7, thickness, 1)
    top_wall.name = "Wall_Section_Top"
    
    # Join the sections into a single mesh object
    bpy.ops.object.select_all(action='SELECT')
    bpy.context.view_layer.objects.active = right_wall
    bpy.ops.object.join()
    
    # Finalize the object properties
    main_wall = bpy.context.active_object
    main_wall.name = "Main_Wall_Skeleton"
    
    # Apply transformations to bake scale into mesh data
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    
    # Export the result to GLB format
    # use_selection=False ensures the entire scene (the wall) is exported
    bpy.ops.export_scene.gltf(
        filepath='/tmp/9ab9d023-9423-4bfe-8708-cee1a5708cde.glb',
        export_format='GLB',
        use_selection=False
    )

# Execute the function directly for headless blender compatibility
create_wall_skeleton()